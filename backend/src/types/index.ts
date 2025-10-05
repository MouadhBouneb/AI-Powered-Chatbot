// Shared types across the application

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Language = "en" | "ar";

export type ModelType = "llama" | "phi3" | "gemma" | "qwen" | "tinyllama";

export interface AIProvider {
  generate(messages: ChatMessage[], language: Language): Promise<string>;
}

export interface OllamaConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface SystemPrompts {
  en: string;
  ar: string;
}
