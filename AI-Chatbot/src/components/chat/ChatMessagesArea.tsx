/**
 * Chat messages display area component
 * Shows messages list and thinking indicator
 */

import { Loader2 } from "lucide-react";
import type { Message } from "../../services/api";
import { ChatMessage } from "./ChatMessage";

interface ChatMessagesAreaProps {
  messages: Message[];
  isStreaming: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  t: (key: string) => string;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  isStreaming,
  messagesEndRef,
  t,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Show all messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Show thinking indicator when streaming but no response yet */}
        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1]?.content === "" && (
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
    </div>
  );
};
