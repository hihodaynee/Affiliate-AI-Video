import React from 'react';
import { MediaAsset } from '../types';
import { MediaUploader } from './MediaUploader';
import { MOTION_PRESETS, AVAILABLE_VIDEO_MODELS } from '../constants';

interface MotionClonerProps {
  sourceVideoAsset: MediaAsset | null;
  characterImageAsset: MediaAsset | null;
  selectedPreset: string;
  customPrompt: string;
  selectedVideoModel: string;
  resolution: '360p' | '720p';
  isGenerating: boolean;
  error: string | null;
  resultVideoAsset: MediaAsset | null;
  onSelectSourceVideo: () => void;
  onClearSourceVideo: () => void;
  onSelectCharacterImage: () => void;
  onClearCharacterImage: () => void;
  onSelectPreset: (id: string, addon: string) => void;
  onPromptChange: (val: string) => void;
  onVideoModelChange: (model: string) => void;
  onResolutionChange: (res: '360p' | '720p') => void;
  onGenerate: () => void;
  onDownload: () => void;
  downloadState: 'idle' | 'downloading' | 'done' | 'error';
}

export const MotionCloner: React.FC<MotionClonerProps> = ({
  sourceVideoAsset,
  characterImageAsset,
  selectedPreset,
  customPrompt,
  selectedVideoModel,
  resolution,
  isGenerating,
  error,
  resultVideoAsset,
  onSelectSourceVideo,
  onClearSourceVideo,
  onSelectCharacterImage,
  onClearCharacterImage,
  onSelectPreset,
  onPromptChange,
  onVideoModelChange,
  onResolutionChange,
  onGenerate,
  onDownload,
  downloadState
}) => {
  const handleClickGenerate = () => {
    if (!sourceVideoAsset) {
      onSelectSourceVideo();
      return;
    }
    if (!characterImageAsset) {
      onSelectCharacterImage();
      return;
    }
    onGenerate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cột trái: Đầu vào video & ảnh tham chiếu */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">directions_bike</span>
              Nguồn Tham Chiếu Bước 2 (Video Reenactment)
            </h3>
            
            {/* Bộ chọn Model Video */}
            <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-xl">
              <span className="material-symbols-outlined text-amber-400 text-xs">videocam</span>
              <label className="text-[11px] text-zinc-400 font-medium">Model:</label>
              <select
                value={selectedVideoModel}
                onChange={(e) => onVideoModelChange(e.target.value)}
                className="bg-transparent text-xs text-amber-300 font-semibold focus:outline-hidden cursor-pointer"
              >
                {AVAILABLE_VIDEO_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MediaUploader
              label="Video Mẫu Chuyển Động"
              sublabel="Video đạp xe, khiêu vũ... (dưới 10s)"
              icon="movie"
              asset={sourceVideoAsset}
              filter="video"
              onSelect={onSelectSourceVideo}
              onClear={onClearSourceVideo}
            />

            <MediaUploader
              label="Ảnh Nhân Vật Mới"
              sublabel="Ảnh đã ghép trang phục từ Bước 1"
              icon="account_circle"
              asset={characterImageAsset}
              filter="image"
              onSelect={onSelectCharacterImage}
              onClear={onClearCharacterImage}
            />
          </div>
        </div>

        {/* Các gợi ý chuyển động (Presets) */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-400">category</span>
              Mẫu Chuyển Động Phổ Biến
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400 mr-1">Độ phân giải:</span>
              {(['720p', '360p'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => onResolutionChange(res)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                    resolution === res
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOTION_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id, preset.promptAddon)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{preset.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">{preset.title}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Prompt chuyển đổi chuyển động an toàn ({selectedVideoModel}):</span>
              <span className="text-[10px] text-emerald-400 font-mono">Bảo đảm tuân thủ nguyên tắc an toàn</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              rows={3}
              className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-amber-500/80 leading-relaxed font-sans"
              placeholder="Prompt giữ chuyển động mẫu và áp đặt ngoại hình mới..."
            />
          </div>

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
                <span>Đang render với {selectedVideoModel} (1-3 phút)...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">video_settings</span>
                <span>
                  {!sourceVideoAsset
                    ? 'Chọn Video Mẫu Để Bắt Đầu'
                    : !characterImageAsset
                    ? 'Chọn Ảnh Nhân Vật Mới'
                    : 'Xuất Video Sao Chép Chuyển Động Mới'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cột phải: Video kết quả */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">smart_display</span>
              Video Hoàn Chỉnh Sau Sao Chép
            </h3>
            {resultVideoAsset && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Đã tự động lưu vào Gallery
              </span>
            )}
          </div>

          <div className="flex-1 bg-zinc-950/80 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] relative">
            {isGenerating ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-zinc-200">Đang tái tạo chuyển động sang nhân vật mới...</p>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  Mô hình {selectedVideoModel} đang phân tích từng frame của video gốc và thay thế nhân vật. Quá trình này thường mất 1-3 phút.
                </p>
              </div>
            ) : resultVideoAsset ? (
              <video
                src={resultVideoAsset.previewUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain max-h-[460px]"
              />
            ) : (
              <div className="text-center p-6 text-zinc-600 space-y-2">
                <span className="material-symbols-outlined text-4xl">movie_filter</span>
                <p className="text-xs">Chưa có video kết quả. Hãy đưa video gốc &amp; ảnh nhân vật rồi bấm Xuất Video.</p>
              </div>
            )}
          </div>

          {resultVideoAsset && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={onDownload}
                disabled={downloadState === 'downloading'}
                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">download</span>
                <span>{downloadState === 'done' ? 'Đã tải thành công ✓' : 'Tải video hoàn chỉnh về máy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};