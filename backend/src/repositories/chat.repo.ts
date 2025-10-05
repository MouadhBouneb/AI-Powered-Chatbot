import { prisma } from "../utils/prisma";
import { getAIProvider } from "../services/ai/providers";

export class ChatRepository {
  // Helper method to clean generated text from markdown and special characters
  private cleanGeneratedText(text: string): string {
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
        .replace(/^(Title:|Subject:|Topic:)\s*/i, "")
        // Clean up extra whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  async createChat(data: { userId: string; model: string; language: string }) {
    return prisma.chat.create({ data });
  }

  async addMessages(
    chatId: string,
    items: { role: string; content: string }[]
  ) {
    return prisma.message.createMany({
      data: items.map((i) => ({ ...i, chatId })),
    });
  }

  async createWithMessages(data: {
    userId: string;
    model: string;
    language: string;
    messages: { role: string; content: string }[];
  }) {
    // Generate AI-powered title from first user message
    const firstUserMessage =
      data.messages.find((m) => m.role === "user")?.content || "New Chat";

    // Detect language from message content (Arabic contains Arabic characters)
    const hasArabic = /[\u0600-\u06FF]/.test(firstUserMessage);
    const messageLanguage = hasArabic ? "ar" : "en";

    // Use detected language or fallback to user's preference
    const titleLanguage = messageLanguage || (data.language as "en" | "ar");

    let title = "New Chat";

    try {
      console.log(
        "🎯 Generating AI-powered chat title in",
        titleLanguage,
        "..."
      );
      // Use LLaMA for title generation (best quality and multilingual support)
      const provider = await getAIProvider("llama");

      const titlePrompt =
        titleLanguage === "ar"
          ? `أنت مساعد ذكي. اقرأ السؤال التالي وأنشئ عنواناً قصيراً واضحاً (3-6 كلمات فقط) يلخص الموضوع الرئيسي. لا تستخدم علامات تنصيص أو أي رموز خاصة مثل النجوم أو الشرطات. العنوان فقط بدون أي تنسيق:\n\n${firstUserMessage}`
          : `You are an AI assistant. Read the following question and generate a short, clear title (3-6 words only) that summarizes the main topic. Do not use quotes, asterisks, dashes, or any special characters or markdown formatting. Just plain text title:\n\n${firstUserMessage}`;

      const generatedTitle = await provider.generate(
        [{ role: "user", content: titlePrompt }],
        titleLanguage
      );

      // Clean up the generated title thoroughly
      title = this.cleanGeneratedText(generatedTitle).substring(0, 60);

      console.log("✅ AI-generated title:", title);
    } catch (error) {
      console.error("❌ Error generating AI title, using fallback:", error);
      // Fallback to truncated first message if AI fails
      title =
        firstUserMessage.length > 50
          ? firstUserMessage.substring(0, 50) + "..."
          : firstUserMessage;
    }

    return prisma.chat.create({
      data: {
        userId: data.userId,
        title: title,
        model: data.model,
        language: data.language,
        messages: { createMany: { data: data.messages } },
      },
      include: { messages: true },
    });
  }

  async listByUser(userId: string) {
    return prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { messages: true },
    });
  }

  async addMessagesToChat(
    chatId: string,
    userId: string,
    messages: { role: string; content: string }[]
  ) {
    // First verify the chat belongs to the user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId,
      },
    });

    if (!chat) {
      throw new Error("Chat not found or access denied");
    }

    // Add new messages to the chat
    await prisma.message.createMany({
      data: messages.map((msg) => ({
        ...msg,
        chatId,
      })),
    });

    // Return the updated chat with all messages
    return prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });
  }

  async delete(chatId: string, userId: string) {
    // First delete all messages in the chat
    await prisma.message.deleteMany({
      where: { chatId },
    });

    // Then delete the chat itself
    return prisma.chat.delete({
      where: {
        id: chatId,
        userId: userId, // Ensure user can only delete their own chats
      },
    });
  }
}
