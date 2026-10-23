import React, { useRef } from 'react';
import { MediaAsset } from '../types';
import { Flow } from 'flow-sdk';

interface MediaUploaderProps {
  label: string;
  sublabel: string;
  icon: string;
  asset: MediaAsset | null;
  filter: 'image' | 'video' | 'audio' | 'all';
  onSelect: () => void;
  onClear: () => void;
  onUploadFile?: (asset: MediaAsset) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  sublabel,
  icon,
  asset,
  filter,
  onSelect,
  onClear,
  onUploadFile
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isAudioOrVoiceSlot = filter === 'audio' || filter === 'all' || asset?.type === 'audio';

  const acceptMime = filter === 'image' 
    ? 'image/png,image/jpeg,image/webp'
    : filter === 'video'
    ? 'video/mp4,video/webm,video/quicktime'
    : filter === 'audio'
    ? 'audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/webm,audio/mp4,audio/ogg'
    : 'audio/*,video/*,image/*';

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const [header, base64] = dataUrl.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      let mimeType = mimeMatch ? mimeMatch[1] : file.type || 'audio/mpeg';

      // Chuẩn hóa loại file
      let type: 'image' | 'video' | 'audio' = 'audio';
      if (mimeType.startsWith('image/')) type = 'image';
      else if (mimeType.startsWith('video/')) type = 'video';
      else type = 'audio';

      // Tạo preview
      let previewUrl = dataUrl;
      try {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: mimeType });
        previewUrl = URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Preview blob fallback:', err);
      }

      // Đẩy vào Flow media gallery nếu là ảnh hoặc video, còn audio thì tạo asset local và mediaId
      let mediaId = `upload_${Date.now()}`;
      try {
        if (type === 'image' || type === 'video') {
          const uploaded = await Flow.upload({
            base64,
            mimeType: mimeType as any,
            name: file.name
          });
          if (uploaded?.mediaId) {
            mediaId = uploaded.mediaId;
          }
        }
      } catch (uploadErr) {
        console.warn('Flow.upload fallback to local id:', uploadErr);
      }

      const newAsset: MediaAsset = {
        mediaId,
        base64,
        mimeType,
        name: file.name || 'Tệp tải lên',
        type,
        previewUrl
      };

      if (onUploadFile) {
        onUploadFile(newAsset);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input để có thể chọn lại file cùng tên
    e.target.value = '';
  };

  return (
    <div className="flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptMime}
        onChange={handleDeviceFileUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-base">{icon}</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider truncate">{label}</h4>
            <p className="text-[11px] text-zinc-400 truncate">{sublabel}</p>
          </div>
        </div>
        {asset && (
          <button
            onClick={onClear}
            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
            title="Xóa và chọn lại"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        )}
      </div>

      {asset ? (
        <div className="relative group rounded-xl overflow-hidden bg-black/60 aspect-video md:aspect-[4/3] flex flex-col items-center justify-center border border-zinc-800 p-2">
          {asset.type === 'video' ? (
            <div className="w-full h-full relative flex flex-col items-center justify-center">
              <video
                src={asset.previewUrl}
                controls
                className="w-full h-full object-contain"
              />
              {isAudioOrVoiceSlot && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/90 text-zinc-950 font-bold font-mono">
                  LẤY ÂM THANH VIDEO ✓
                </div>
              )}
            </div>
          ) : asset.type === 'audio' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 p-2 text-center">
              <span className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                <span className="material-symbols-outlined">mic</span>
              </span>
              <p className="text-xs font-bold text-zinc-100 truncate max-w-full px-2" title={asset.name}>
                {asset.name || 'Tệp Giọng Voice FLOW (MP3/WAV)'}
              </p>
              <audio src={asset.previewUrl} controls className="w-full h-8 max-w-[200px]" />
            </div>
          ) : (
            <img
              src={asset.previewUrl}
              alt={asset.name}
              className="w-full h-full object-contain"
            />
          )}

          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-white text-xs font-semibold z-10">
            <button
              onClick={onSelect}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-1.5 cursor-pointer w-full justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm">photo_library</span>
              <span>Chọn từ Thư viện Flow</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer w-full justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>Tải file MP3 / Video từ máy</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950/40 hover:bg-zinc-850 hover:border-amber-500/50 transition-all aspect-video md:aspect-[4/3] flex flex-col items-center justify-center gap-2 p-3 text-center">
          <div className="w-9 h-9 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>

          <div className="w-full space-y-1.5">
            {isAudioOrVoiceSlot ? (
              <div className="flex flex-col gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm shadow-amber-500/20"
                >
                  <span className="material-symbols-outlined text-xs">upload_file</span>
                  <span>Tải File MP3 / Âm Thanh Từ Máy</span>
                </button>

                <button
                  type="button"
                  onClick={onSelect}
                  className="w-full py-1.5 px-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-xs text-amber-400">photo_library</span>
                  <span>Chọn từ Thư Viện Flow</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full">
                <button
                  type="button"
                  onClick={onSelect}
                  className="w-full py-1.5 px-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-xs text-amber-400">photo_library</span>
                  <span>Chọn từ Thư Viện Flow</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">upload</span>
                  <span>Tải tệp từ thiết bị</span>
                </button>
              </div>
            )}

            <p className="text-[10px] text-zinc-500 leading-tight">
              {isAudioOrVoiceSlot 
                ? 'Hỗ trợ MP3, WAV, M4A, hoặc MP4 lấy tiếng' 
                : filter === 'image' 
                ? 'PNG, JPG, WebP' 
                : 'Video MP4 dưới 10 giây'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};