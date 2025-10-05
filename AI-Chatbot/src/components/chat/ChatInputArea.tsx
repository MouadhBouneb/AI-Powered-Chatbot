/**
 * Chat input area component
 * Handles user input and message sending
 */

import { Send } from "lucide-react";

interface ChatInputAreaProps {
  input: string;
  isStreaming: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  input,
  isStreaming,
  onInputChange,
  onSend,
  onKeyPress,
  t,
}) => {
  return (
    <div className="bg-white border-t border-slate-200 p-3 md:p-4">
      <div className="max-w-4xl mx-auto flex gap-2 md:gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={t("chat.type_message")}
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isStreaming}
        />
        <button
          onClick={onSend}
          disabled={isStreaming || !input.trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Send className="w-5 h-5" />
          {t("chat.send")}
        </button>
      </div>
    </div>
  );
};
