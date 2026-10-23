import React from 'react';
import { MediaAsset } from '../types';
import { Flow } from 'flow-sdk';

export interface MediaInspectData {
  asset: MediaAsset;
  title: string;
  stageName?: string;
  sceneNumber?: number;
  durationSeconds?: number;
  modelName?: string;
  aspectRatio?: string;
  resolution?: string;
  dialogue?: string;
  prompt?: string;
  actingGuide?: string;
  cameraAngle?: string;
}

interface MediaInspectModalProps {
  data: MediaInspectData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaInspectModal: React.FC<MediaInspectModalProps> = ({
  data,
  isOpen,
  onClose
}) => {
  if (!isOpen || !data) return null;

  const { asset } = data;
  const isVideo = asset.type === 'video';

  const handleDownload = async () => {
    try {
      const ext = isVideo ? 'mp4' : 'png';
      await Flow.download({
        base64: asset.base64,
        mimeType: (asset.mimeType as any) || (isVideo ? 'video/mp4' : 'image/png'),
        filename: `${asset.name || 'media_asset'}.${ext}`
      });
    } catch (e) {
      console.error('Lỗi tải tệp:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl text-zinc-100 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border ${
              isVideo
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              <span className="material-symbols-outlined text-base">
                {isVideo ? 'smart_display' : 'image'}
              </span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">{data.title}</h3>
                {data.stageName && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                    {data.stageName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {isVideo ? 'Chi Tiết Video Phân Cảnh & Thông Số Kỹ Thuật' : 'Chi Tiết Hình Ảnh & Thông Số Kỹ Thuật'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              title="Tải tệp này về máy"
            >
              <span className="material-symbols-outlined text-sm font-bold">download</span>
              <span>Tải về</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Nội dung chia 2 phần: Trái hiển thị to, Phải là thông số */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          {/* Cột trái: Media to, rõ nét */}
          <div className="lg:col-span-7 bg-black rounded-2xl border border-zinc-850 flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[420px] max-h-[580px] relative">
            {isVideo ? (
              <video
                src={asset.previewUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={asset.previewUrl}
                alt={data.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Cột phải: Bảng thông số chi tiết */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {/* Badge Thông số nhanh */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-mono block">Loại Tệp &amp; Định Dạng</span>
                  <span className="font-bold text-white uppercase text-[11px]">
                    {isVideo ? 'Video (MP4)' : 'Hình Ảnh'} • {asset.mimeType}
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-mono block">Mô Hình AI (Model)</span>
                  <span className="font-bold text-amber-300 text-[11px] truncate block" title={data.modelName || 'Mặc định'}>
                    {data.modelName || (isVideo ? 'Omni 1.1 Flash' : '🍌 Nano Banana Pro')}
                  </span>
                </div>

                {data.durationSeconds !== undefined && (
                  <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-zinc-500 font-mono block">Thời Lượng Video</span>
                    <span className="font-bold text-indigo-300 text-[11px]">
                      {data.durationSeconds} giây (Khớp thoại)
                    </span>
                  </div>
                )}

                {data.aspectRatio && (
                  <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-zinc-500 font-mono block">Tỉ Lệ Khung Hình</span>
                    <span className="font-bold text-cyan-300 text-[11px] font-mono">
                      {data.aspectRatio}
                    </span>
                  </div>
                )}
              </div>

              {/* Lời thoại nếu có */}
              {data.dialogue && (
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">record_voice_over</span>
                    <span>Lời Thoại KOC:</span>
                  </span>
                  <p className="text-xs text-zinc-200 italic leading-relaxed">
                    &ldquo;{data.dialogue}&rdquo;
                  </p>
                </div>
              )}

              {/* Hướng dẫn diễn xuất / Cú máy */}
              {(data.actingGuide || data.cameraAngle) && (
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-1.5 text-xs">
                  {data.cameraAngle && (
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-xs text-cyan-400 mt-0.5 shrink-0">videocam</span>
                      <span className="text-zinc-300 leading-snug">
                        <strong className="text-zinc-400">Góc máy:</strong> {data.cameraAngle}
                      </span>
                    </div>
                  )}
                  {data.actingGuide && (
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-xs text-emerald-400 mt-0.5 shrink-0">directions_run</span>
                      <span className="text-zinc-300 leading-snug">
                        <strong className="text-zinc-400">Diễn xuất:</strong> {data.actingGuide}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Prompt AI */}
              {data.prompt && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 font-mono">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Prompt AI Được Sử Dụng:
                  </span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed max-h-36 overflow-y-auto select-all pr-1">
                    {data.prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Media ID */}
            <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="truncate">Media ID: {asset.mediaId}</span>
              <span className="text-emerald-400 shrink-0">✓ Đã lưu Gallery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};