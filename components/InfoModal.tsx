import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl p-5 md:p-7 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Đóng"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-2xl">movie_filter</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Affiliate AI Video</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-amber-400 font-mono font-medium truncate">by hitechmmo • Bộ công cụ sản xuất video AI Affiliate tự động</p>
          </div>
        </div>

        {/* Các kênh MXH & Website chính thức - Tối ưu Grid responsive */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 my-4 space-y-2.5">
          <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">share</span>
            <span>Kênh Thông Tin &amp; Hỗ Trợ Chính Thức:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <a
              href="https://www.facebook.com/profile.php?id=61594632656414"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-zinc-900 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/40 text-blue-400 flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">public</span>
              <span className="font-semibold truncate">Facebook Fanpage</span>
            </a>

            <a
              href="https://www.tiktok.com/@hi.tech.mmo"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-zinc-900 hover:bg-pink-600/20 border border-zinc-800 hover:border-pink-500/40 text-pink-400 flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">music_note</span>
              <span className="font-semibold truncate">TikTok @hi.tech.mmo</span>
            </a>

            <a
              href="https://www.hitechdev.site/"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-zinc-900 hover:bg-amber-600/20 border border-zinc-800 hover:border-amber-500/40 text-amber-300 flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-base">language</span>
              <span className="font-semibold truncate">hitechdev.site</span>
            </a>
          </div>
        </div>

        <div className="space-y-3.5 my-5 text-sm text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              <span className="material-symbols-outlined text-sm">face_retouching_natural</span>
            </div>
            <div>
              <p className="font-semibold text-white">Tạo Nhân Vật KOC AI</p>
              <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                Tạo chân dung người mẫu KOC với Nano Banana Pro hoặc trích xuất từ ảnh mẫu bằng AI Vision. Sau khi có nhân vật ưng ý, chuyển thẳng sang Kịch Bản Review để giữ đồng nhất khuôn mặt xuyên suốt video.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              <span className="material-symbols-outlined text-sm">movie_creation</span>
            </div>
            <div>
              <p className="font-semibold text-white">Kịch Bản Review Bán Hàng 5 Phân Cảnh</p>
              <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                Tự động tạo kịch bản bán hàng chuẩn tâm lý (Hook → Nỗi đau → Ra mắt → Trải nghiệm → CTA). Tự động khớp thời lượng (4s, 6s, 8s, 10s) của Omni 1.1 Flash theo độ dài lời thoại tiếng Việt.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0">
              <span className="material-symbols-outlined text-sm">directions_bike</span>
            </div>
            <div>
              <p className="font-semibold text-white">Sao Chép Chuyển Động (Motion Cloner)</p>
              <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                Thay trang phục mới cho nhân vật giữ trọn khuôn mặt, sau đó sao chép toàn bộ nhịp chuyển động (Catwalk, đạp xe, vũ đạo...) từ video mẫu gốc.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Khám Phá Affiliate AI Video v1.0</span>
          <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};