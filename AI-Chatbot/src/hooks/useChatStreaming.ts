import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import { chatApi } from "../services/api";
import type { ModelType } from "../types/chat.types";

// ============================================================================
// Types
// ============================================================================

interface StreamingState {
  isStreaming: boolean;
  streamingMessage: string;
  error: string | null;
}

interface StreamChatParams {
  model: ModelType;
  messages: { role: "user" | "assistant"; content: string }[];
  chatId?: string;
  onChunkReceived?: (chunk: string, fullText: string) => void;
  onComplete?: (
    fullResponse: string,
    chatData?: { id: string; title: string },
    streamedMessages?: { role: "user" | "assistant"; content: string }[]
  ) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useChatStreaming() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    streamingMessage: "",
    error: null,
  });

  const streamChat = useCallback(
    async ({
      model,
      messages,
      chatId,
      onChunkReceived,
      onComplete,
      onError,
    }: StreamChatParams) => {
      setState({ isStreaming: true, streamingMessage: "", error: null });

      let fullResponse = "";
      let chatData: { id: string; title: string } | undefined;

      try {
        // Stream the response
        for await (const data of chatApi.createChatStream(
          model,
          messages,
          chatId
        )) {
          if (data.chunk) {
            fullResponse += data.chunk;
            setState((prev) => ({
              ...prev,
              streamingMessage: fullResponse,
            }));
            onChunkReceived?.(data.chunk, fullResponse);
          }
          if (data.chat) {
            chatData = data.chat;
          }
        }

        // Streaming complete - reset state immediately
        setState({ isStreaming: false, streamingMessage: "", error: null });

        // Update React Query cache with new chat data if available
        if (chatData) {
          // Create the full chat object with all required fields
          const newChat = {
            id: chatData.id,
            title: chatData.title,
            model: "llama",
            language: "en",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
              ...messages,
              {
                role: "assistant" as const,
                content: fullResponse,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
              },
            ], // Include the streamed response with proper structure
          };

          // Use the same logic as useCreateChat hook
          queryClient.setQueryData(queryKeys.chats.list(), (oldData: any) => {
            console.log(
              "🔄 Cache update - old data length:",
              oldData?.chats?.length
            );
            console.log(
              "🔄 Cache update - new chat:",
              newChat.id,
              newChat.title
            );

            if (!oldData?.chats) {
              console.log("📝 No existing chats, creating new array");
              return { chats: [newChat] };
            }

            const existingIndex = oldData.chats.findIndex(
              (chat: any) => chat.id === chatData.id
            );

            if (existingIndex >= 0) {
              // Update existing chat and move to top
              console.log("📝 Updating existing chat at index:", existingIndex);
              const newChats = [...oldData.chats];
              newChats[existingIndex] = {
                ...newChats[existingIndex],
                ...newChat,
              };
              // Move to beginning for last interaction
              const updatedChat = newChats.splice(existingIndex, 1)[0];
              return { chats: [updatedChat, ...newChats] };
            } else {
              // Add new chat to the beginning
              return { chats: [newChat, ...oldData.chats] };
            }
          });

          // Verify cache was updated
          const updatedCache = queryClient.getQueryData(queryKeys.chats.list());
          console.log(
            "✅ Cache updated successfully, new length:",
            updatedCache?.chats?.length
          );
        }

        onComplete?.(fullResponse, chatData, [
          ...messages,
          {
            role: "assistant" as const,
            content: fullResponse,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Streaming failed";
        setState({
          isStreaming: false,
          streamingMessage: "",
          error: errorMessage,
        });
        onError?.(error as Error);
      }
    },
    [queryClient]
  );

  const reset = useCallback(() => {
    setState({ isStreaming: false, streamingMessage: "", error: null });
  }, []);

  return {
    ...state,
    streamChat,
    reset,
  };
}
