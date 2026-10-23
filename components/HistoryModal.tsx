import React from 'react';
import { GeneratedHistoryItem } from '../types';
import { Flow } from 'flow-sdk';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedHistoryItem[];
  onRestoreAttributes: (item: GeneratedHistoryItem) => void;
  onSelectForPreview: (item: GeneratedHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestoreAttributes,
  onSelectForPreview,
  onClearHistory
}) => {
  if (!isOpen) return null;

  const handleDownload = async (item: GeneratedHistoryItem) => {
    if (!item.imageUrl) return;
    try {
      const base64 = item.imageUrl.split(',')[1];
      await Flow.download({
        base64,
        mimeType: 'image/jpeg',
        filename: `AI_Influencer_${item.id}.jpg`
      });
    } catch (e) {
      console.error('Lỗi khi tải ảnh:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-xl">history</span>
            <h3 className="text-sm font-bold text-white">Lịch Sử Tạo Ảnh AI ({history.length})</h3>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors mr-2 cursor-pointer"
              >
                Xóa toàn bộ
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
              <span className="material-symbols-outlined text-4xl">photo_library</span>
              <p className="text-xs">Chưa có lịch sử tạo ảnh nào.</p>
              <p className="text-[10px] text-zinc-600 max-w-xs">
                Mỗi lần bạn tạo ảnh chân dung AI, hệ thống sẽ tự động lưu lại prompt, hình ảnh và thuộc tính cấu hình tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3 hover:border-zinc-700 transition-all"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail ảnh */}
                    <div
                      onClick={() => onSelectForPreview(item)}
                      className="w-24 h-32 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-850 flex items-center justify-center cursor-pointer group relative"
                    >
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt="History Item"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                            <span className="material-symbols-outlined text-base">zoom_in</span>
                          </div>
                        </>
                      ) : (
                        <span className="material-symbols-outlined text-zinc-600">image</span>
                      )}
                    </div>

                    {/* Thông tin prompt & thời gian */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold border border-amber-500/20">
                          {item.aspectRatio} • {item.model}
                        </span>
                        <span className="text-zinc-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-300 font-mono line-clamp-3 leading-relaxed">
                        {item.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                    <button
                      onClick={() => onRestoreAttributes(item)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Nạp lại các thiết lập này vào form"
                    >
                      <span className="material-symbols-outlined text-xs">restore</span>
                      <span>Tải lại cấu hình này</span>
                    </button>

                    {item.imageUrl && (
                      <button
                        onClick={() => handleDownload(item)}
                        className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Tải ảnh về máy"
                      >
                        <span className="material-symbols-outlined text-xs">download</span>
                        <span>Tải ảnh</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};