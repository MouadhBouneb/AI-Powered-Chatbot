/**
 * Utility functions for chat operations
 */

import type { ModelType, AvailableModel } from "../types/chat.types";

/**
 * Extracts and validates model type from available models list
 */
export const getModelTypeFromList = (
  models: AvailableModel[],
  defaultModel: ModelType
): ModelType => {
  if (models.length === 0) return defaultModel;
  return models[0].type as ModelType;
};

/**
 * Checks if Enter key was pressed without Shift
 */
export const isEnterWithoutShift = (
  event: React.KeyboardEvent<HTMLInputElement>
): boolean => {
  return event.key === "Enter" && !event.shiftKey;
};
