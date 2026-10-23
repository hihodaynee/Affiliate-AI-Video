import React, { useState } from 'react';
import { Flow } from 'flow-sdk';

interface ImageZoomModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  title = 'Kiểm Tra Chi Tiết Chân Dung AI'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = async () => {
    try {
      setDownloadState('downloading');
      const base64 = imageUrl.split(',')[1];
      await Flow.download({
        base64,
        mimeType: 'image/jpeg',
        filename: `AI_Influencer_Detail_${Date.now()}.jpg`
      });
      setDownloadState('done');
      setTimeout(() => setDownloadState('idle'), 2000);
    } catch (e) {
      console.error(e);
      setDownloadState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">zoom_in</span>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <span className="material-symbols-outlined text-base">zoom_out</span>
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Phóng to"
            >
              <span className="material-symbols-outlined text-base">zoom_in</span>
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
              title="Đặt lại kích thước ban đầu"
            >
              100%
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">download</span>
              <span>{downloadState === 'done' ? 'Đã tải ✓' : 'Tải về'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Viewport chứa ảnh phóng to cuộn mượt mà */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/90">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out'
            }}
            className="flex items-center justify-center max-w-full max-h-full"
          >
            <img
              src={imageUrl}
              alt="Detailed View"
              className="max-h-[75vh] object-contain rounded-xl shadow-2xl cursor-grab"
            />
          </div>
        </div>
      </div>
    </div>
  );
};