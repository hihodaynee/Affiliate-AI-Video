import React from 'react';
import { GenerationHistoryEntry, MediaAsset } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryEntry[];
  onSelectAsReference: (entry: GenerationHistoryEntry) => void;
  onDownloadAsset: (asset: MediaAsset) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAsReference,
  onDownloadAsset,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col text-zinc-100 shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">history</span>
            <h3 className="text-sm font-bold text-white">Lịch Sử Tạo Ảnh &amp; Video ({history.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
                title="Xóa toàn bộ lịch sử"
              >
                Xóa hết
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Danh sách History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
              <span className="material-symbols-outlined text-4xl">folder_open</span>
              <p className="text-xs">Chưa có lịch sử tạo nào.</p>
              <p className="text-[10px] text-zinc-600 max-w-xs">Mỗi khi tạo ảnh hoặc video phân cảnh, kết quả sẽ được lưu trữ tự động tại đây để bạn có thể tái sử dụng làm tham chiếu.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    item.type === 'image' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.type === 'image' ? 'Ảnh Phân Cảnh' : 'Video Omni Flash'} {item.sceneNumber ? `(#${item.sceneNumber})` : ''}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-zinc-900">
                  {item.type === 'image' ? (
                    <img
                      src={item.asset.previewUrl}
                      alt="History asset"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={item.asset.previewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 italic">
                  &ldquo;{item.prompt}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                  <span className="text-[10px] text-zinc-500 font-mono">{item.model}</span>
                  <div className="flex gap-2">
                    {item.type === 'image' && (
                      <button
                        onClick={() => onSelectAsReference(item)}
                        className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Dùng ảnh này làm tham chiếu cho phân cảnh khác"
                      >
                        <span className="material-symbols-outlined text-xs">add_to_photos</span>
                        <span>Tham Chiếu</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDownloadAsset(item.asset)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">download</span>
                      <span>Tải về</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};