import { useState, useCallback } from "react";
import type { Message, Chat } from "../services/api";

// ============================================================================
// Types
// ============================================================================

interface MessageState {
  messages: Message[];
  currentChat: Chat | null;
}

// ============================================================================
// Hook: useChatMessages
// ============================================================================

/**
 * Custom hook for managing chat messages state
 * Provides utilities for adding, updating, and managing messages
 */
export function useChatMessages() {
  const [state, setState] = useState<MessageState>({
    messages: [],
    currentChat: null,
  });

  /**
   * Sets the current chat and its messages
   */
  const setCurrentChat = useCallback((chat: Chat | null) => {
    setState((prev) => {
      // If switching to the same chat, preserve messages
      if (prev.currentChat?.id === chat?.id) {
        console.log(
          "🔄 Same chat selected, preserving messages:",
          prev.messages.length
        );
        return {
          currentChat: chat,
          messages: prev.messages,
        };
      }

      // If switching to a different chat, use its messages
      const messages = chat?.messages || [];

      console.log(
        "🔄 Switching to chat:",
        chat?.title,
        "Messages:",
        messages.length
      );

      return {
        currentChat: chat,
        messages,
      };
    });
  }, []);

  /**
   * Adds a new user message
   */
  const addUserMessage = useCallback((content: string): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, []);

  /**
   * Adds an empty assistant message (for streaming)
   */
  const addEmptyAssistantMessage = useCallback((): Message => {
    const newMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, []);

  /**
   * Updates the last assistant message content (for streaming)
   */
  const updateLastAssistantMessage = useCallback((content: string) => {
    setState((prev) => {
      const updatedMessages = [...prev.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (lastMessage?.role === "assistant") {
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content,
        };
      }

      return {
        ...prev,
        messages: updatedMessages,
      };
    });
  }, []);

  /**
   * Removes the last N messages (for error handling)
   */
  const removeLastMessages = useCallback((count: number = 1) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.slice(0, -count),
    }));
  }, []);

  /**
   * Clears all messages (start new chat)
   */
  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      currentChat: null,
    });
  }, []);

  /**
   * Updates current chat metadata after save
   */
  const updateCurrentChatData = useCallback(
    (
      chatData: { id: string; title: string },
      model: string,
      language: string
    ) => {
      setState((prev) => {
        console.log(
          "🔄 Updating current chat data, preserving messages:",
          prev.messages.length
        );
        return {
          ...prev,
          currentChat: {
            id: chatData.id,
            title: chatData.title,
            model,
            language,
            createdAt: new Date().toISOString(),
            messages: prev.messages, // Preserve current messages
          },
        };
      });
    },
    []
  );

  return {
    messages: state.messages,
    currentChat: state.currentChat,
    setCurrentChat,
    addUserMessage,
    addEmptyAssistantMessage,
    updateLastAssistantMessage,
    removeLastMessages,
    clearMessages,
    updateCurrentChatData,
  };
}
