import React, { useState } from 'react';
import { CharacterAttributes } from '../types';
import { buildCharacterPrompt, buildShortPromptSummary } from '../utils/promptBuilder';

interface PromptDisplayProps {
  attributes: CharacterAttributes;
  isGenerating: boolean;
  onGenerateImage: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onOpenImageAnalyzer?: () => void;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({
  attributes,
  isGenerating,
  onGenerateImage,
  onExportJSON,
  onImportJSON
}) => {
  const [copied, setCopied] = useState(false);
  const promptText = buildCharacterPrompt(attributes);
  const summaryText = buildShortPromptSummary(attributes);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 md:p-6 space-y-4 shadow-xl">
      {/* Header Prompt Box gọn gàng */}
      <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg">terminal</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Prompt Tiếng Anh
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {attributes.aspectRatio}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {summaryText}
          </p>
        </div>
      </div>

      {/* Vùng hiển thị Prompt */}
      <div className="relative">
        <textarea
          readOnly
          value={promptText}
          rows={5}
          className="w-full p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-xs text-amber-200/90 font-mono leading-relaxed select-all focus:outline-hidden focus:border-amber-500/50"
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
          {promptText.length} ký tự
        </div>
      </div>

      {/* Nút thao tác đặt ngay bên dưới nội dung Prompt */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
            copied
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Đã sao chép prompt!' : 'Sao chép prompt'}</span>
        </button>

        <button
          type="button"
          onClick={onExportJSON}
          className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          title="Lưu cấu hình nhân vật ra file JSON"
        >
          <span className="material-symbols-outlined text-sm text-cyan-400">download</span>
          <span>Xuất JSON</span>
        </button>

        <button
          type="button"
          onClick={onImportJSON}
          className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          title="Khôi phục nhân vật từ file JSON đã lưu"
        >
          <span className="material-symbols-outlined text-sm text-emerald-400">upload</span>
          <span>Nhập JSON</span>
        </button>
      </div>

      {/* Nút Tạo Chân Dung Nhân Vật AI: cố định chiều cao h-[46px], không đổi kích thước khi loading */}
      <button
        type="button"
        onClick={onGenerateImage}
        disabled={isGenerating}
        className={`w-full h-[46px] px-4 rounded-2xl font-black text-xs md:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer whitespace-nowrap ${
          isGenerating
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-amber-500/20 active:scale-[0.99]'
        }`}
      >
        {isGenerating ? (
          <>
            <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Đang Tạo Chân Dung...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg shrink-0">auto_awesome</span>
            <span>Tạo Chân Dung Nhân Vật AI</span>
          </>
        )}
      </button>
    </div>
  );
};