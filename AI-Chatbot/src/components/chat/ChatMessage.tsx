import { User, Cpu } from "lucide-react";
import { Message } from "../../services/api";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Cpu className="w-5 h-5 text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-slate-800 border border-slate-200 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
          {message.content}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};
