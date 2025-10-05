import type { AIProvider, ChatMessage, Language, ModelType } from "../../types";
import { MODEL_NAMES } from "../../constants";
import { generateWithOllama, getLastUserMessage } from "../../utils/ollama";

// ============================================================================
// Fallback Provider
// ============================================================================

class SimpleRuleProvider implements AIProvider {
  async generate(messages: ChatMessage[], language: Language): Promise<string> {
    const last = getLastUserMessage(messages);
    if (!last) {
      return language === "ar"
        ? "من فضلك أدخل سؤالاً."
        : "Please ask a question.";
    }
    return language === "ar"
      ? `سؤالك كان: "${last}". هذه إجابة عامة بدون نموذج.`
      : `You asked: "${last}". This is a generic response without a model.`;
  }
}

// ============================================================================
// Ollama Provider (Unified for all Ollama models)
// ============================================================================

class OllamaProvider implements AIProvider {
  constructor(
    private modelName: string,
    private promptType: "general" | "expert" = "general"
  ) {}

  async generate(messages: ChatMessage[], language: Language): Promise<string> {
    try {
      return await generateWithOllama(
        this.modelName,
        messages,
        language,
        this.promptType
      );
    } catch (error: any) {
      console.error(`❌ ${error.message}`);
      const fallback = new SimpleRuleProvider();
      return fallback.generate(messages, language);
    }
  }
}

// ============================================================================
// Provider Factory
// ============================================================================

export async function getAIProvider(kind: ModelType): Promise<AIProvider> {
  switch (kind) {
    // Ollama models - primary AI providers
    case "llama":
      return new OllamaProvider(MODEL_NAMES.llama, "general");
    case "phi3":
      return new OllamaProvider(MODEL_NAMES.phi3, "general");
    case "gemma":
      return new OllamaProvider(MODEL_NAMES.gemma, "general");
    case "qwen":
      return new OllamaProvider(MODEL_NAMES.qwen, "general");
    case "tinyllama":
      return new OllamaProvider(MODEL_NAMES.tinyllama, "general");

    default:
      return new SimpleRuleProvider();
  }
}

// Export types for other modules
export type { ChatMessage, Language, AIProvider, ModelType } from "../../types";
