import React from 'react';
import { SceneCard, MediaAsset } from '../types';
import { calculateWordCount, estimateSafeDuration, getMaxWordsForDuration } from '../utils/durationCalculator';
import { MediaInspectData } from './MediaInspectModal';

interface SceneCardItemProps {
  scene: SceneCard;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
  timeoutSecondsLeft: number | null;
  selectedImageModel?: string;
  selectedVideoModel?: string;
  aspectRatio?: string;
  onEditDetail: () => void;
  onUpdateDialogue: (newDialogue: string) => void;
  onUpdateDuration: (newDuration: 4 | 6 | 8 | 10) => void;
  onDirectRetryImage: () => void;
  onDirectRetryVideo: () => void;
  onOpenRegenerateImageModal: () => void;
  onOpenRegenerateModal: () => void;
  onDownloadAsset: (asset: MediaAsset) => void;
  onInspectMedia: (data: MediaInspectData) => void;
}

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Mở đầu (Hook)': { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Vấn đề & Nỗi đau': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Giải pháp / Ra mắt': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Trải nghiệm & Điểm mạnh': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Lời kêu gọi (CTA)': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' }
};

export const SceneCardItem: React.FC<SceneCardItemProps> = ({
  scene,
  isGeneratingImage,
  isGeneratingVideo,
  timeoutSecondsLeft,
  selectedImageModel,
  selectedVideoModel,
  aspectRatio,
  onEditDetail,
  onUpdateDialogue,
  onUpdateDuration,
  onDirectRetryImage,
  onDirectRetryVideo,
  onOpenRegenerateImageModal,
  onOpenRegenerateModal,
  onDownloadAsset,
  onInspectMedia
}) => {
  const isBusy = isGeneratingImage || isGeneratingVideo;
  const stageTheme = STAGE_COLORS[scene.stageName] || { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };

  const wordCount = calculateWordCount(scene.dialogue);
  const currentDuration = scene.durationSeconds || 4;
  const maxSafeWords = getMaxWordsForDuration(currentDuration);
  const recommendedDuration = estimateSafeDuration(scene.dialogue);
  const isSpeechRisk = wordCount > maxSafeWords;

  const hasImage = Boolean(scene.generatedImage);
  const hasVideo = Boolean(scene.generatedVideo);
  const isError = scene.status === 'error';

  const handleAutoFixDuration = () => {
    onUpdateDuration(recommendedDuration);
  };

  const handleClickImageCenter = () => {
    if (!scene.generatedImage) return;
    onInspectMedia({
      asset: scene.generatedImage,
      title: `Ảnh Phân Cảnh #${scene.sceneNumber}`,
      stageName: scene.stageName,
      sceneNumber: scene.sceneNumber,
      modelName: selectedImageModel,
      aspectRatio: aspectRatio || '9:16',
      dialogue: scene.dialogue,
      prompt: scene.imagePrompt,
      actingGuide: scene.actingGuide,
      cameraAngle: scene.cameraAngle
    });
  };

  const handleClickVideoCenter = () => {
    if (!scene.generatedVideo) return;
    onInspectMedia({
      asset: scene.generatedVideo,
      title: `Video Phân Cảnh #${scene.sceneNumber}`,
      stageName: scene.stageName,
      sceneNumber: scene.sceneNumber,
      durationSeconds: currentDuration,
      modelName: selectedVideoModel,
      aspectRatio: aspectRatio || '9:16',
      dialogue: scene.dialogue,
      prompt: scene.videoPrompt,
      actingGuide: scene.actingGuide,
      cameraAngle: scene.cameraAngle
    });
  };

  return (
    <div className={`bg-zinc-900/95 border ${isError ? 'border-red-500/70 shadow-red-950/40 shadow-lg ring-1 ring-red-500/40' : 'border-zinc-800 hover:border-zinc-700/80'} rounded-2xl p-3 flex flex-col justify-between transition-all shadow-lg min-w-0 group/card relative`}>
      <div className="space-y-2">
        {/* Header Phân Cảnh: Thu gọn phần hiển thị số giây để 4 thuộc tính hiển thị đủ, không đè lấn */}
        <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 border border-amber-500/30">
              #{scene.sceneNumber}
            </span>
            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border ${stageTheme.bg} ${stageTheme.text} ${stageTheme.border} truncate`} title={scene.stageName}>
              {scene.stageName}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Badge số giây siêu tinh gọn (chỉ hiển thị 4s/6s/8s/10s, không tràn vào các phần khác) */}
            <div className="flex items-center bg-zinc-950 px-1 py-0.5 rounded-md border border-zinc-800 hover:border-amber-500/50 transition-colors">
              <span className="material-symbols-outlined text-[10px] text-amber-400 mr-0.5">timer</span>
              <select
                value={currentDuration}
                onChange={(e) => onUpdateDuration(Number(e.target.value) as 4 | 6 | 8 | 10)}
                className="bg-transparent text-[10px] font-mono text-amber-300 font-bold focus:outline-hidden cursor-pointer"
                title="Thời lượng clip"
              >
                <option value={4} className="bg-zinc-900 text-white">4s</option>
                <option value={6} className="bg-zinc-900 text-white">6s</option>
                <option value={8} className="bg-zinc-900 text-white">8s</option>
                <option value={10} className="bg-zinc-900 text-white">10s</option>
              </select>
            </div>

            <button
              onClick={onEditDetail}
              className="p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              title="Chỉnh sửa chi tiết kịch bản, góc quay & prompt"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
            </button>
          </div>
        </div>

        {/* Lời thoại KOC */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-amber-300/90 flex items-center gap-1 truncate">
              <span className="material-symbols-outlined text-xs">record_voice_over</span>
              Lời thoại KOC:
            </span>
            <span className={`font-mono text-[9px] ${isSpeechRisk ? 'text-rose-400 font-bold' : 'text-zinc-500'}`} title="Tối ưu cho nhịp nói tiếng Việt">
              {wordCount}/{maxSafeWords} từ ({currentDuration}s)
            </span>
          </div>

          <textarea
            rows={2}
            value={scene.dialogue}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateDialogue(val);
              const needed = estimateSafeDuration(val);
              if (needed > currentDuration) {
                onUpdateDuration(needed);
              }
            }}
            className={`w-full p-2 bg-zinc-950 border focus:border-amber-500/80 rounded-xl text-[11px] text-zinc-200 resize-none focus:outline-hidden leading-relaxed placeholder:text-zinc-600 ${
              isSpeechRisk ? 'border-rose-500/40 ring-1 ring-rose-500/30' : 'border-zinc-800'
            }`}
            placeholder="Nhập lời thoại KOC..."
          />

          {isSpeechRisk && (
            <div className="flex items-center justify-between bg-rose-950/50 border border-rose-500/40 px-2 py-1 rounded-lg">
              <span className="text-[9px] text-rose-300 flex items-center gap-1 leading-tight truncate">
                <span className="material-symbols-outlined text-[11px] text-rose-400">warning</span>
                <span>{wordCount} từ quá dài ({currentDuration}s)! Cần {recommendedDuration}s.</span>
              </span>
              <button
                type="button"
                onClick={handleAutoFixDuration}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors cursor-pointer shrink-0 ml-1 flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-inline text-[10px]">auto_fix_high</span>
                <span>Khớp {recommendedDuration}s</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 thuộc tính nhận diện: Hiển thị gọn gàng, rõ ràng không bị đè lấn */}
        <div className="p-2 bg-zinc-950/70 rounded-xl border border-zinc-800/80 text-[10px] text-zinc-400 space-y-1">
          {scene.productVisualDetails && (
            <div className="flex items-center gap-1 text-emerald-400 font-medium truncate">
              <span className="material-symbols-outlined text-xs shrink-0">inventory_2</span>
              <span className="truncate" title={scene.productVisualDetails}>{scene.productVisualDetails}</span>
            </div>
          )}
          <div className="flex items-start gap-1 leading-snug">
            <span className="material-symbols-outlined text-cyan-400 text-xs shrink-0 mt-0.5">directions_run</span>
            <p className="line-clamp-1" title={scene.actingGuide}>{scene.actingGuide}</p>
          </div>
        </div>
      </div>

      <div className="my-2.5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Cột 1: Ảnh phân cảnh */}
          <div className="rounded-xl overflow-hidden bg-black/70 border border-zinc-800 aspect-[9/13] flex flex-col items-center justify-center relative group">
            {isGeneratingImage ? (
              <div className="text-center p-2 space-y-1.5">
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-[9px] text-amber-300 font-mono block">Đang tạo...</span>
              </div>
            ) : scene.generatedImage ? (
              <>
                <img
                  src={scene.generatedImage.previewUrl}
                  alt={`Cảnh ${scene.sceneNumber}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleClickImageCenter}
                />
                
                <button
                  type="button"
                  onClick={handleClickImageCenter}
                  className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  title="Bấm vào để mở to ảnh kèm thông số"
                >
                  <span className="material-symbols-outlined text-2xl text-amber-400">zoom_in</span>
                  <span className="text-[9px] font-bold mt-0.5 bg-black/80 px-1.5 py-0.5 rounded">Mở to &amp; Thông số</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadAsset(scene.generatedImage!);
                  }}
                  className="absolute bottom-1 right-1 p-1 bg-black/80 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  title="Tải ảnh về máy"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                </button>
              </>
            ) : (
              <div className="text-center p-1 text-zinc-600 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-lg">image</span>
                <span className="text-[9px]">Chưa có ảnh</span>
              </div>
            )}
            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[8px] bg-black/70 text-zinc-300 font-bold backdrop-blur-xs pointer-events-none">
              ẢNH
            </span>
          </div>

          {/* Cột 2: Video phân cảnh */}
          <div className="rounded-xl overflow-hidden bg-black/70 border border-zinc-800 aspect-[9/13] flex flex-col items-center justify-center relative group">
            {isGeneratingVideo ? (
              <div className="text-center p-2 space-y-1">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-[9px] text-indigo-300 font-mono block">Render...</span>
                {timeoutSecondsLeft !== null && (
                  <span className="text-[8px] text-amber-400 font-mono block">
                    {Math.floor(timeoutSecondsLeft / 60)}:{('0' + (timeoutSecondsLeft % 60)).slice(-2)}
                  </span>
                )}
              </div>
            ) : scene.generatedVideo ? (
              <>
                <video
                  src={scene.generatedVideo.previewUrl}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleClickVideoCenter}
                />

                <button
                  type="button"
                  onClick={handleClickVideoCenter}
                  className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  title="Bấm vào để mở to video kèm thông số"
                >
                  <span className="material-symbols-outlined text-2xl text-indigo-400">fullscreen</span>
                  <span className="text-[9px] font-bold mt-0.5 bg-black/80 px-1.5 py-0.5 rounded">Mở to &amp; Thông số</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadAsset(scene.generatedVideo!);
                  }}
                  className="absolute bottom-1 right-1 p-1 bg-black/80 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  title="Tải video về máy"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                </button>
              </>
            ) : (
              <div className="text-center p-1 text-zinc-600 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-lg">smart_display</span>
                <span className="text-[9px]">Chưa có video</span>
              </div>
            )}
            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[8px] bg-black/70 text-zinc-300 font-bold backdrop-blur-xs pointer-events-none">
              VIDEO ({currentDuration}s)
            </span>
          </div>
        </div>

        {/* Nút hành động tạo lại / làm lại */}
        <div className="pt-1">
          {isError ? (
            hasImage ? (
              <button
                type="button"
                onClick={onDirectRetryVideo}
                disabled={isBusy}
                className="w-full h-[34px] px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30 whitespace-nowrap overflow-hidden active:scale-[0.98]"
                title="Bấm để thử tạo lại video ngay lập tức (không hỏi lý do)"
              >
                <span className="material-symbols-outlined text-sm font-bold shrink-0">replay</span>
                <span className="truncate">Tạo Lại Cảnh Lỗi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onDirectRetryImage}
                disabled={isBusy}
                className="w-full h-[34px] px-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/30 whitespace-nowrap overflow-hidden active:scale-[0.98]"
                title="Bấm để thử tạo lại ảnh ngay lập tức (không hỏi lý do)"
              >
                <span className="material-symbols-outlined text-sm font-bold shrink-0">replay</span>
                <span className="truncate">Tạo Lại Ảnh Lỗi</span>
              </button>
            )
          ) : hasVideo ? (
            <button
              type="button"
              onClick={onOpenRegenerateModal}
              disabled={isBusy}
              className="w-full h-[34px] px-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-40 whitespace-nowrap overflow-hidden"
              title="Đã có video. Bấm để làm lại theo góp ý/lý do cụ thể."
            >
              <span className="material-symbols-outlined text-sm shrink-0">videocam</span>
              <span className="truncate">Làm Lại Video</span>
            </button>
          ) : hasImage ? (
            <button
              type="button"
              onClick={onOpenRegenerateImageModal}
              disabled={isBusy}
              className="w-full h-[34px] px-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-40 whitespace-nowrap overflow-hidden"
              title="Đã có ảnh. Bấm để làm lại ảnh theo góp ý/lý do cụ thể."
            >
              <span className="material-symbols-outlined text-sm shrink-0">add_photo_alternate</span>
              <span className="truncate">Làm Lại Ảnh</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDirectRetryImage}
              disabled={isBusy}
              className="w-full h-[34px] px-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap overflow-hidden"
              title="Tạo ảnh riêng cho phân cảnh này"
            >
              <span className="material-symbols-outlined text-sm text-amber-400 shrink-0">add_photo_alternate</span>
              <span className="truncate">Tạo Ảnh Riêng</span>
            </button>
          )}
        </div>

        {scene.errorMessage && (
          <div className="p-2 bg-red-950/60 border border-red-500/40 rounded-xl text-[10px] text-red-300 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 min-w-0">
              <span className="material-symbols-outlined text-xs shrink-0 text-red-400">error</span>
              <span className="line-clamp-2">{scene.errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={hasImage ? onDirectRetryVideo : onDirectRetryImage}
              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[9px] shrink-0 cursor-pointer flex items-center gap-0.5"
              title="Thử lại ngay lập tức"
            >
              <span className="material-symbols-outlined text-[10px]">replay</span>
              <span>Tạo Lại</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};