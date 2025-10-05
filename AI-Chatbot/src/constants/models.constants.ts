/**
 * Model configuration and default options
 */

import type { AvailableModel } from "../types/chat.types";

export const DEFAULT_MODEL = "llama";

export const FALLBACK_MODELS: AvailableModel[] = [
  { id: "llama3.2:3b", type: "llama", name: "Llama" },
  { id: "phi3:mini", type: "phi3", name: "Phi-3" },
  { id: "gemma:2b", type: "gemma", name: "Gemma" },
  { id: "qwen2.5:3b", type: "qwen", name: "Qwen" },
  { id: "tinyllama:latest", type: "tinyllama", name: "TinyLlama" },
];

export const MODEL_OPTIONS = {
  llama: { label: "Llama", value: "llama" },
  phi3: { label: "Phi-3", value: "phi3" },
  gemma: { label: "Gemma", value: "gemma" },
  qwen: { label: "Qwen", value: "qwen" },
  tinyllama: { label: "TinyLlama", value: "tinyllama" },
} as const;
