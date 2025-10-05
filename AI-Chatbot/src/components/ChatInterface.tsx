import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useBackendAuth } from "../contexts/BackendAuthContext";
import { useChats, useCreateChat, useDeleteChat } from "../hooks/useApi";
import { Chat, Message, modelsApi } from "../services/api";
import { ChatSidebar, ChatMessage } from "./chat";
import { LoadingSpinner } from "./common";

export const ChatInterface = () => {
  const { t } = useTranslation();
  const { user } = useBackendAuth();
  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const createChatMutation = useCreateChat();
  const deleteChatMutation = useDeleteChat();

  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<
    "llama" | "mistral" | "deepseek" | "phi3" | "gemma" | "qwen"
  >("phi3");
  const [availableModels, setAvailableModels] = useState<
    Array<{ id: string; type: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats = useMemo(() => chatsData?.chats || [], [chatsData?.chats]);

  // Fetch available models from Ollama
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await modelsApi.listModels();
        setAvailableModels(data.models);
        if (data.models.length > 0) {
          setModel(data.models[0].type);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, []);

  // Set initial chat and sync currentChat with refetched data
  useEffect(() => {
    if (chats.length > 0) {
      if (!currentChat) {
        setCurrentChat(chats[0]);
      } else {
        const updatedChat = chats.find((c) => c.id === currentChat.id);
        if (updatedChat && updatedChat !== currentChat) {
          setCurrentChat(updatedChat);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats]);

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
    }
  }, [currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewChat = () => {
    if (!user) return;

    // ChatGPT-style: Create empty chat UI immediately
    // Chat will be saved to database when first message is sent
    setCurrentChat(null);
    setMessages([]);
    setInput("");
    // Don't show toast for new chat - it's just UI state
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm(t("chat.confirm_delete"))) return;

    try {
      // If deleting current chat, switch to new empty chat first
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      // Delete from backend
      await deleteChatMutation.mutateAsync(chatId);

      toast.success(t("chat.delete_chat") + " " + t("common.success"));
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(t("chat.error_send_failed"));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      // Add user message to local state immediately
      const newUserMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: userMessage,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newUserMessage]);

      const result = await createChatMutation.mutateAsync({
        model: model as
          | "llama"
          | "mistral"
          | "deepseek"
          | "phi3"
          | "gemma"
          | "qwen",
        messages: [...messages, newUserMessage],
        chatId: currentChat?.id,
      });

      // Update current chat and messages with AI response
      setCurrentChat(result.chat);
      setMessages(result.chat.messages || []);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("chat.error_send_failed"));
      // Remove the optimistically added message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

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
        isOpen={sidebarOpen}
        chats={chats}
        currentChatId={currentChat?.id || null}
        onCreateChat={createNewChat}
        onSelectChat={setCurrentChat}
        onDeleteChat={handleDeleteChat}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-3 md:p-4 flex items-center gap-2 md:gap-4 flex-wrap">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <div className="w-5 h-0.5 bg-slate-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-slate-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-slate-600"></div>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-xs md:text-sm font-medium text-slate-700 whitespace-nowrap">
              {t("chat.select_model")}
            </label>
            <select
              value={model}
              onChange={(e) =>
                setModel(
                  e.target.value as
                    | "llama"
                    | "mistral"
                    | "deepseek"
                    | "phi3"
                    | "gemma"
                    | "qwen"
                )
              }
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {availableModels.length > 0 ? (
                availableModels.map((m) => (
                  <option key={m.id} value={m.type}>
                    {m.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="phi3">Phi-3 Mini (Fast & High Quality)</option>
                  <option value="gemma">Gemma 2B (Ultra Lightweight)</option>
                  <option value="qwen">Qwen 2.5 3B (Multilingual)</option>
                  <option value="llama">Llama 3.2 3B (Premium)</option>
                  <option value="mistral">Mistral 7B (Balanced)</option>
                  <option value="deepseek">DeepSeek (Advanced)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-500 text-base md:text-lg mb-2">
                  {t("chat.empty_chat")}
                </p>
                <p className="text-slate-400 text-sm">
                  {t("chat.start_conversation")}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 md:px-5 md:py-3 flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-blue-600" />
                    <span className="text-slate-600 text-sm md:text-base">
                      {t("chat.thinking")}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-3 md:p-4">
          <div className="max-w-4xl mx-auto flex gap-2 md:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder={t("chat.type_message")}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Send className="w-5 h-5" />
              {t("chat.send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
