// Application constants

export const OLLAMA_CONFIG = {
  BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  TIMEOUT: 300_000, // 5 minutes for model loading
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 256, // Reduced for faster responses
} as const;

export const CACHE_CONFIG = {
  AI_RESPONSE_TTL: 7200, // 2 hours - increased for better caching
  CHAT_HISTORY_TTL: 600, // 10 minutes - increased for performance
} as const;

export const SYSTEM_PROMPTS = {
  GENERAL: {
    en: "You are a helpful AI assistant. Answer clearly and politely in English.",
    ar: "أنت مساعد ذكي مفيد. أجب باللغة العربية بطريقة واضحة ومهذبة.",
  },
  EXPERT: {
    en: "You are an expert AI assistant. Answer accurately and professionally in English.",
    ar: "أنت مساعد ذكي متخصص. أجب باللغة العربية بدقة واحترافية.",
  },
} as const;

export const MODEL_NAMES = {
  llama: "llama3.2:3b",
  phi3: "phi3:mini",
  gemma: "gemma:2b",
  qwen: "qwen2.5:3b",
  tinyllama: "tinyllama:latest",
} as const;
