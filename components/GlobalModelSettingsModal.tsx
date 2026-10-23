import React from 'react';
import { AVAILABLE_IMAGE_MODELS, AVAILABLE_VIDEO_MODELS } from '../constants';

interface GlobalModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImageModel: string;
  onImageModelChange: (model: string) => void;
  selectedVideoModel: string;
  onVideoModelChange: (model: string) => void;
}

export const GlobalModelSettingsModal: React.FC<GlobalModelSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedImageModel,
  onImageModelChange,
  selectedVideoModel,
  onVideoModelChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Đóng"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-800">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">settings_suggest</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Cài Đặt Model AI Dùng Chung</h3>
            <p className="text-xs text-amber-400/90 font-mono">
              Thiết lập đồng bộ cho cả 3 chức năng: Tạo KOC, Review Bán Hàng &amp; Motion Cloner
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Cài đặt Model Tạo Ảnh */}
          <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-base text-amber-400">image</span>
                <span>1. Model Tạo Hình Ảnh (Image Model)</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {selectedImageModel.includes('Lite') ? '⚡ Tiết kiệm hạn mức' : '🌟 Độ nét cao'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Nếu <strong>Nano Banana Pro</strong> gặp giới hạn hạn mức hoặc quá tải, bạn có thể chuyển ngay sang <strong>Nano Banana 2 Lite</strong> (nhanh, tiết kiệm hạn mức) hoặc <strong>Nano Banana 2.1</strong> mà không bị gián đoạn.
            </p>

            <div className="space-y-2">
              {AVAILABLE_IMAGE_MODELS.map((model) => {
                const isSelected = selectedImageModel === model.id;
                return (
                  <label
                    key={model.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="global_image_model"
                      value={model.id}
                      checked={isSelected}
                      onChange={() => onImageModelChange(model.id)}
                      className="mt-0.5 accent-amber-500 cursor-pointer"
                    />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{model.name}</span>
                        {model.id === '🍌 Nano Banana 2 Lite' && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                            Chống Hết Quota
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                        Mã hiệu SDK: {model.id}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Cài đặt Model Tạo Video */}
          <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-base text-indigo-400">videocam</span>
                <span>2. Model Tạo Video Chuyển Động (Video Model)</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                Mặc định: Omni 1.1 Flash
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Dùng để dựng video phân cảnh có người mẫu nói tiếng Việt hoặc sao chép cử chỉ từ video gốc.
            </p>

            <div className="space-y-2">
              {AVAILABLE_VIDEO_MODELS.map((model) => {
                const isSelected = selectedVideoModel === model.id;
                return (
                  <label
                    key={model.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/40 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="global_video_model"
                      value={model.id}
                      checked={isSelected}
                      onChange={() => onVideoModelChange(model.id)}
                      className="mt-0.5 accent-indigo-500 cursor-pointer"
                    />
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{model.name}</span>
                        {model.id === 'Omni 1.1 Flash' && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                            Khớp 4s - 10s
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                        Mã hiệu SDK: {model.id}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            ✓ Các lựa chọn sẽ lập tức áp dụng cho mọi thao tác tạo ảnh &amp; video trên ứng dụng.
          </p>
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer text-xs"
          >
            Lưu &amp; Áp Dụng Ngay
          </button>
        </div>
      </div>
    </div>
  );
};