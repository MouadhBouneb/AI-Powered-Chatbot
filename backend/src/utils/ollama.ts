import type { ChatMessage, Language, OllamaConfig } from "../types";
import { OLLAMA_CONFIG, SYSTEM_PROMPTS } from "../constants";

/**
 * Get the last user message from the messages array
 */
export function getLastUserMessage(messages: ChatMessage[]): string {
  return messages.filter((m) => m.role === "user").pop()?.content || "";
}

/**
 * Build a system prompt based on language and type
 */
export function buildSystemPrompt(
  language: Language,
  type: "general" | "expert" = "general"
): string {
  return type === "expert"
    ? SYSTEM_PROMPTS.EXPERT[language]
    : SYSTEM_PROMPTS.GENERAL[language];
}

/**
 * Build a full prompt with system instructions and user message
 */
export function buildFullPrompt(
  messages: ChatMessage[],
  language: Language,
  promptType: "general" | "expert" = "general"
): string {
  const systemPrompt = buildSystemPrompt(language, promptType);
  const lastUserMessage = getLastUserMessage(messages);
  return `${systemPrompt}\n\nUser: ${lastUserMessage}\n\nAssistant:`;
}

/**
 * Call Ollama API with error handling and timeout
 */
export async function callOllamaAPI(
  config: OllamaConfig,
  prompt: string
): Promise<string> {
  try {
    const axios = (await import("axios")).default;

    const response = await axios.post(
      `${OLLAMA_CONFIG.BASE_URL}/api/generate`,
      {
        model: config.model,
        prompt,
        options: {
          temperature: config.temperature ?? OLLAMA_CONFIG.DEFAULT_TEMPERATURE,
          num_predict: config.maxTokens ?? OLLAMA_CONFIG.DEFAULT_MAX_TOKENS,
        },
        stream: false,
      },
      {
        timeout: config.timeout ?? OLLAMA_CONFIG.TIMEOUT,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.status >= 400) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    return response.data.response?.trim() || "No response";
  } catch (error: any) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        `${config.model} timeout - model may be loading (first request takes longer)`
      );
    }
    throw new Error(`${config.model} error: ${error.message}`);
  }
}

/**
 * Generate AI response using Ollama with fallback
 */
export async function generateWithOllama(
  modelName: string,
  messages: ChatMessage[],
  language: Language,
  promptType: "general" | "expert" = "general"
): Promise<string> {
  const prompt = buildFullPrompt(messages, language, promptType);
  const config: OllamaConfig = { model: modelName };

  return callOllamaAPI(config, prompt);
}
