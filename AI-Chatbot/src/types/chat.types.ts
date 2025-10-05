/**
 * Type definitions for chat-related functionality
 */

export type ModelType = "llama" | "phi3" | "gemma" | "qwen" | "tinyllama";

export interface AvailableModel {
  id: string;
  type: string;
  name: string;
}

export interface ChatInterfaceState {
  input: string;
  model: ModelType;
  availableModels: AvailableModel[];
  sidebarOpen: boolean;
}
