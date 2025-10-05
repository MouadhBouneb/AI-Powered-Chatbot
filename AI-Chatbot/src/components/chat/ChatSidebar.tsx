import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Chat } from "../../services/api";

interface ChatSidebarProps {
  isOpen: boolean;
  chats: Chat[];
  currentChatId: string | null;
  onCreateChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatSidebar = ({
  isOpen,
  chats,
  currentChatId,
  onCreateChat,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`${
        isOpen ? "w-64 md:w-72" : "w-0"
      } bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden flex flex-col fixed md:relative h-[calc(100vh-4rem)] z-20`}
    >
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={onCreateChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {t("chat.new_chat")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">
          {t("chat.chat_history")}
        </h3>
        {chats.length === 0 ? (
          <p className="text-sm text-slate-500 px-2 py-4">
            {t("chat.no_chats")}
          </p>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <span className="text-sm truncate flex-1">{chat.title}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors touch-target-min"
                    aria-label={t("chat.delete_chat")}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
