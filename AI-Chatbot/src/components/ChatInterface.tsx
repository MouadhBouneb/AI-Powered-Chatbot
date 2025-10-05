/**
 * Main Chat Interface Component
 * Orchestrates chat functionality with clean separation of concerns
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// Contexts & Hooks
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { useChats, useDeleteChat } from "../hooks/useApi";
import { useChatStreaming } from "../hooks/useChatStreaming";
import { useChatMessages } from "../hooks/useChatMessages";
import { queryKeys } from "../lib/queryClient";

// Services & APIs

// Components
import {
  ChatSidebar,
  ChatHeader,
  ChatMessagesArea,
  ChatInputArea,
} from "./chat";
import { LoadingSpinner } from "./common";

// Types & Constants
import type { ModelType } from "../types/chat.types";
import { DEFAULT_MODEL } from "../constants/models.constants";

// Utilities
import { isEnterWithoutShift } from "../utils/chat.utils";

// ============================================================================
// Main Component
// ============================================================================

export const ChatInterface = () => {
  const { t } = useTranslation();
  const { user } = useBackendAuth();
  const queryClient = useQueryClient();

  // API Hooks
  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const deleteChatMutation = useDeleteChat();

  // Custom Hooks
  const { isStreaming, streamChat } = useChatStreaming();
  const {
    messages,
    currentChat,
    setCurrentChat,
    addUserMessage,
    addEmptyAssistantMessage,
    updateLastAssistantMessage,
    removeLastMessages,
    clearMessages,
    updateCurrentChatData,
  } = useChatMessages();

  // Local State
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelType>(DEFAULT_MODEL);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chats = useMemo(() => chatsData?.chats || [], [chatsData?.chats]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Force refresh chats on component mount to ensure fresh data
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() });
    }
  }, [user, queryClient]);

  // Models are now hardcoded in ChatHeader, no need to fetch

  useEffect(() => {
    if (chats.length > 0 && !currentChat) {
      setCurrentChat(chats[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCreateNewChat = () => {
    if (!user) return;
    clearMessages();
    setInput("");
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm(t("chat.confirm_delete"))) return;

    try {
      if (currentChat?.id === chatId) {
        clearMessages();
      }
      await deleteChatMutation.mutateAsync(chatId);
      toast.success(`${t("chat.delete_chat")} ${t("common.success")}`);
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(t("chat.error_send_failed"));
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user || isStreaming) return;

    const userMessageContent = input;
    setInput("");

    try {
      const userMessage = addUserMessage(userMessageContent);
      addEmptyAssistantMessage();

      await streamChat({
        model,
        messages: [...messages, userMessage],
        chatId: currentChat?.id,
        onChunkReceived: (_chunk, fullText) => {
          updateLastAssistantMessage(fullText);
        },
        onComplete: (_fullText, chatData) => {
          if (chatData) {
            // Update current chat with returned data
            if (!currentChat) {
              updateCurrentChatData(chatData, model, user?.language || "en");
            }
          }
        },
        onError: (error) => {
          console.error("Streaming error:", error);
          toast.error(t("chat.error_send_failed"));
          removeLastMessages(2);
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("chat.error_send_failed"));
      removeLastMessages(1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEnterWithoutShift(e)) {
      handleSendMessage();
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (chatsLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-slate-50 items-center justify-center">
        <LoadingSpinner size="lg" text={t("common.loading")} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50">
      <ChatSidebar
        key={chats.length} // Force re-render when chats change
        isOpen={sidebarOpen}
        chats={chats}
        currentChatId={currentChat?.id || null}
        onCreateChat={handleCreateNewChat}
        onSelectChat={setCurrentChat}
        onDeleteChat={handleDeleteChat}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full">
        <ChatHeader
          model={model}
          onModelChange={setModel}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          t={t}
        />

        <ChatMessagesArea
          messages={messages}
          isStreaming={isStreaming}
          messagesEndRef={messagesEndRef}
          t={t}
        />

        <ChatInputArea
          input={input}
          isStreaming={isStreaming}
          onInputChange={setInput}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          t={t}
        />
      </div>
    </div>
  );
};
