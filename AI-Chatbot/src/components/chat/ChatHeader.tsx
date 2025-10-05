/**
 * Chat header component
 * Contains sidebar toggle and model selector
 */

import type { ModelType } from "../../types/chat.types";

interface ChatHeaderProps {
  model: ModelType;
  onModelChange: (model: ModelType) => void;
  onToggleSidebar: () => void;
  t: (key: string) => string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  model,
  onModelChange,
  onToggleSidebar,
  t,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 p-3 md:p-4 flex items-center gap-2 md:gap-4 flex-wrap">
      <button
        onClick={onToggleSidebar}
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
          onChange={(e) => onModelChange(e.target.value as ModelType)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="llama">Llama</option>
          <option value="phi3">Phi-3</option>
          <option value="gemma">Gemma</option>
          <option value="qwen">Qwen</option>
          <option value="tinyllama">TinyLlama</option>
        </select>
      </div>
    </div>
  );
};
