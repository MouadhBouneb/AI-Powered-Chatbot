/**
 * Validation utilities
 */

import type { ChatMessage } from "../types";

/**
 * Gets the last message from an array and validates it exists
 * @throws Error if no message is found
 */
export const getLastUserMessage = (messages: ChatMessage[]): ChatMessage => {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    throw new Error("No user message found");
  }
  return lastMessage;
};

/**
 * Validates that a message array contains required user and assistant messages
 */
export const validateMessagesForSaving = (
  messages: ChatMessage[]
): { userMessage: ChatMessage; assistantMessage: ChatMessage } => {
  const userMessage = messages.find((m) => m.role === "user");
  const assistantMessage = messages.find((m) => m.role === "assistant");

  if (!userMessage || !assistantMessage) {
    throw new Error(
      "Invalid messages: must include user and assistant messages"
    );
  }

  return { userMessage, assistantMessage };
};
