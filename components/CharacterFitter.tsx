import React from 'react';
import { MediaAsset } from '../types';
import { MediaUploader } from './MediaUploader';
import { AVAILABLE_IMAGE_MODELS } from '../constants';

interface CharacterFitterProps {
  personAsset: MediaAsset | null;
  outfitAsset: MediaAsset | null;
  customPrompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '3:4';
  selectedImageModel: string;
  isGenerating: boolean;
  error: string | null;
  resultAsset: MediaAsset | null;
  onSelectPerson: () => void;
  onClearPerson: () => void;
  onSelectOutfit: () => void;
  onClearOutfit: () => void;
  onPromptChange: (val: string) => void;
  onAspectRatioChange: (val: '1:1' | '16:9' | '9:16' | '3:4') => void;
  onImageModelChange: (model: string) => void;
  onGenerate: () => void;
  onUseForStep2: () => void;
  onDownload: () => void;
  downloadState: 'idle' | 'downloading' | 'done' | 'error';
}

export const CharacterFitter: React.FC<CharacterFitterProps> = ({
  personAsset,
  outfitAsset,
  customPrompt,
  aspectRatio,
  selectedImageModel,
  isGenerating,
  error,
  resultAsset,
  onSelectPerson,
  onClearPerson,
  onSelectOutfit,
  onClearOutfit,
  onPromptChange,
  onAspectRatioChange,
  onImageModelChange,
  onGenerate,
  onUseForStep2,
  onDownload,
  downloadState
}) => {
  const handleClickGenerate = () => {
    if (!personAsset) {
      onSelectPerson();
      return;
    }
    if (!outfitAsset) {
      onSelectOutfit();
      return;
    }
    onGenerate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cột trái: Đầu vào */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">checkroom</span>
              Nguồn Tham Chiếu Bước 1
            </h3>
            
            {/* Bộ chọn Model ảnh */}
            <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-xl">
              <span className="material-symbols-outlined text-amber-400 text-xs">smart_toy</span>
              <label className="text-[11px] text-zinc-400 font-medium">Model:</label>
              <select
                value={selectedImageModel}
                onChange={(e) => onImageModelChange(e.target.value)}
                className="bg-transparent text-xs text-amber-300 font-semibold focus:outline-hidden cursor-pointer"
              >
                {AVAILABLE_IMAGE_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MediaUploader
              label="Ảnh Nhân Vật"
              sublabel="Giữ khuôn mặt, vóc dáng"
              icon="person"
              asset={personAsset}
              filter="image"
              onSelect={onSelectPerson}
              onClear={onClearPerson}
            />

            <MediaUploader
              label="Ảnh Trang Phục"
              sublabel="Áo quần, phụ kiện, chất liệu"
              icon="styler"
              asset={outfitAsset}
              filter="image"
              onSelect={onSelectOutfit}
              onClear={onClearOutfit}
            />
          </div>
        </div>

        {/* Cấu hình Prompt & Tỉ lệ */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-400">tune</span>
              Prompt ghép trang phục chuẩn (Đã tối ưu hóa tiêu chuẩn)
            </label>
            <div className="flex items-center gap-1">
              {(['9:16', '16:9', '1:1', '3:4'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => onAspectRatioChange(ratio)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={customPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={3}
            className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 leading-relaxed font-sans"
            placeholder="Nhập mô tả chi tiết nếu muốn thay đổi bối cảnh, ánh sáng..."
          />

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleClickGenerate}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý ghép nhân vật ({selectedImageModel})...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>
                  {!personAsset 
                    ? 'Chọn Ảnh Nhân Vật Để Bắt Đầu' 
                    : !outfitAsset 
                    ? 'Chọn Ảnh Trang Phục' 
                    : 'Tạo Nhân Vật Mặc Trang Phục Mới'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cột phải: Xem kết quả Bước 1 */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">image</span>
              Kết Quả Bước 1
            </h3>
            {resultAsset && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Sẵn sàng cho Bước 2
              </span>
            )}
          </div>

          <div className="flex-1 bg-zinc-950/80 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] relative">
            {isGenerating ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-zinc-200">Đang tạo nhân vật mặc đồ mới...</p>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  Sử dụng {selectedImageModel} giữ trọn nét mặt và phom dáng trang phục.
                </p>
              </div>
            ) : resultAsset ? (
              <img
                src={resultAsset.previewUrl}
                alt="Kết quả ghép nhân vật"
                className="w-full h-full object-contain max-h-[460px]"
              />
            ) : (
              <div className="text-center p-6 text-zinc-600 space-y-2">
                <span className="material-symbols-outlined text-4xl">person_pin</span>
                <p className="text-xs">Chưa có kết quả. Hãy chọn ảnh nhân vật &amp; đồ rồi bấm Tạo.</p>
              </div>
            )}
          </div>

          {resultAsset && (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={onUseForStep2}
                className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>Chuyển sang Bước 2 (Sao chép video)</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <button
                onClick={onDownload}
                disabled={downloadState === 'downloading'}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Tải ảnh về máy"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>{downloadState === 'done' ? 'Đã tải ✓' : 'Tải về'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};