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
 * Call Ollama API with error handling and timeout (Non-streaming)
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
          num_ctx: 2048, // Reduced context window for speed
          num_batch: 512, // Larger batch size for faster processing
          num_thread: 8, // Use 8 CPU threads
          num_gpu: 1, // Use GPU if available (set to 0 to disable)
          top_k: 40, // Reduce sampling pool for faster generation
          top_p: 0.9, // Nucleus sampling for speed
          repeat_penalty: 1.1, // Prevent repetition
          // Additional optimizations:
          use_mmap: true, // Use memory mapping for faster model loading
          use_mlock: false, // Don't lock memory (allows swapping if needed)
          num_keep: 4, // Keep only 4 tokens from prompt for context
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
 * Call Ollama API with streaming support
 * Returns an async generator that yields response chunks
 */
export async function* callOllamaAPIStream(
  config: OllamaConfig,
  prompt: string
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        options: {
          temperature: config.temperature ?? OLLAMA_CONFIG.DEFAULT_TEMPERATURE,
          num_predict: config.maxTokens ?? OLLAMA_CONFIG.DEFAULT_MAX_TOKENS,
          num_ctx: 2048,
          num_batch: 512,
          num_thread: 8,
          num_gpu: 1,
          top_k: 40,
          top_p: 0.9,
          repeat_penalty: 1.1,
          use_mmap: true,
          use_mlock: false,
          num_keep: 4,
        },
        stream: true, // Enable streaming
      }),
      signal: AbortSignal.timeout(config.timeout ?? OLLAMA_CONFIG.TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            yield parsed.response;
          }
          if (parsed.done) {
            return;
          }
        } catch (e) {
          // Skip invalid JSON lines
          continue;
        }
      }
    }
  } catch (error: any) {
    if (error.name === "TimeoutError") {
      throw new Error(
        `${config.model} timeout - model may be loading (first request takes longer)`
      );
    }
    throw new Error(`${config.model} error: ${error.message}`);
  }
}

/**
 * Generate AI response using Ollama (Non-streaming)
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

/**
 * Generate AI response using Ollama with streaming
 */
export async function* generateWithOllamaStream(
  modelName: string,
  messages: ChatMessage[],
  language: Language,
  promptType: "general" | "expert" = "general"
): AsyncGenerator<string, void, unknown> {
  const prompt = buildFullPrompt(messages, language, promptType);
  const config: OllamaConfig = { model: modelName };

  yield* callOllamaAPIStream(config, prompt);
}
