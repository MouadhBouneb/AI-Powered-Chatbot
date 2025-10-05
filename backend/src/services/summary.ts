import { prisma } from "../utils/prisma";
import { getAIProvider } from "./ai/providers";

// Helper function to clean generated text from markdown and special characters
function cleanGeneratedText(text: string): string {
  return (
    text
      .trim()
      // Remove markdown formatting
      .replace(/\*\*/g, "") // Bold
      .replace(/\*/g, "") // Italic/emphasis
      .replace(/_{1,2}/g, "") // Underline
      .replace(/~{1,2}/g, "") // Strikethrough
      .replace(/`{1,3}/g, "") // Code blocks
      .replace(/#{1,6}\s/g, "") // Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links [text](url) -> text
      // Remove quotes
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/^["""''']+|["""''']+$/g, "") // Unicode quotes
      // Remove common prefixes
      .replace(/^(Summary:|الملخص:)\s*/i, "")
      // Clean up extra whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

export async function summarizeUser(
  userId: string
): Promise<{ en: string; ar: string }> {
  console.log("📊 Generating bilingual user summary for userId:", userId);

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { messages: true },
  });

  console.log(`📚 Found ${chats.length} chats for summary`);

  // Get unique user messages (avoid duplicates)
  const userMessages = new Set<string>();
  chats.forEach((chat) => {
    chat.messages
      .filter((m) => m.role === "user")
      .forEach((m) => userMessages.add(m.content));
  });

  const combined = Array.from(userMessages).join("\n- ");
  console.log(`💬 Total unique messages: ${userMessages.size}`);

  // Always use LLaMA for summaries (best quality and multilingual support)
  const provider = await getAIProvider("llama");
  console.log(`🤖 Using LLaMA model for bilingual summary generation`);

  // Generate English summary
  console.log("🇬🇧 Generating English summary...");
  const englishPrompt = {
    role: "user" as const,
    content: `You are an AI assistant. You MUST respond in English only. Summarize the user's interests based on their questions below. Write a brief, clear summary (2-3 sentences) about their topics of interest in English. Do not use any special characters, asterisks, quotes, or markdown formatting. Write plain text only in English.\n\nQuestions:\n${combined}\n\nWrite the summary in English:`,
  };
  const englishText = await provider.generate([englishPrompt], "en");
  const cleanedEnglish = cleanGeneratedText(englishText);
  const arabicPrompt = {
    role: "user" as const,
    content: `أنت مساعد ذكي يجب عليك الرد بالعربية فقط. قم بتلخيص اهتمامات المستخدم بناءً على أسئلته التالية. اكتب ملخصاً قصيراً واضحاً (2-3 جمل) عن مواضيع اهتمامه باللغة العربية. لا تستخدم أي رموز خاصة أو علامات تنصيص أو نجوم. اكتب نصاً عادياً فقط بالعربية.\n\nالأسئلة:\n${combined}\n\nاكتب الملخص بالعربية فقط:`,
  };
  const arabicText = await provider.generate([arabicPrompt], "ar");
  const cleanedArabic = cleanGeneratedText(arabicText);

  return { en: cleanedEnglish, ar: cleanedArabic };
}
