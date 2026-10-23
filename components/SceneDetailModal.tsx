import React from 'react';
import { SceneCard } from '../types';
import { calculateWordCount, getMaxWordsForDuration, estimateSafeDuration } from '../utils/durationCalculator';

interface SceneDetailModalProps {
  scene: SceneCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedScene: SceneCard) => void;
}

export const SceneDetailModal: React.FC<SceneDetailModalProps> = (props) => {
  if (!props.isOpen || !props.scene) return null;
  return <SceneDetailModalContent key={props.scene.id} {...props} scene={props.scene} />;
};

const SceneDetailModalContent: React.FC<SceneDetailModalProps & { scene: SceneCard }> = ({
  scene,
  isOpen,
  onClose,
  onSave
}) => {

  const [form, setForm] = React.useState<SceneCard>({ ...scene });

  React.useEffect(() => {
    setForm({ ...scene });
  }, [scene]);

  const wordCount = calculateWordCount(form.dialogue);
  const currentDuration = form.durationSeconds || 4;
  const maxSafeWords = getMaxWordsForDuration(currentDuration);
  const recommendedDuration = estimateSafeDuration(form.dialogue);
  const isSpeechTooLong = wordCount > maxSafeWords;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
              #{form.sceneNumber}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Chỉnh Sửa Chi Tiết Phân Cảnh &amp; Khớp Giọng Đọc</h3>
              <p className="text-xs text-amber-400 font-mono font-medium">{form.stageName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thông tin cốt lõi & Metadata phân cảnh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Tiêu Đề Phân Cảnh:
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-amber-400">schedule</span>
                  Thời Lượng Video:
                </span>
                <span className="text-[10px] text-zinc-500">Omni Flash</span>
              </label>
              <select
                value={form.durationSeconds || 4}
                onChange={(e) => setForm({ ...form, durationSeconds: Number(e.target.value) as any })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-amber-300 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value={4} className="bg-zinc-900">4 giây (Tối đa 12 từ)</option>
                <option value={6} className="bg-zinc-900">6 giây (Tối đa 18 từ - Chuẩn Hook)</option>
                <option value={8} className="bg-zinc-900">8 giây (Tối đa 25 từ - Thoại dài)</option>
                <option value={10} className="bg-zinc-900">10 giây (Tối đa 32 từ - Tối đa)</option>
              </select>
            </div>
          </div>

          {/* Lời thoại & Khớp nhịp nói */}
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">record_voice_over</span>
                Lời Thoại KOC &amp; Kiểm Soát Độ Dài Khớp Thời Lượng:
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isSpeechTooLong 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {wordCount}/{maxSafeWords} từ an toàn ({form.durationSeconds}s)
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={form.dialogue}
              onChange={(e) => setForm({ ...form, dialogue: e.target.value })}
              placeholder="Nhập lời thoại KOC..."
              className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500 leading-relaxed font-sans"
            />

            {isSpeechTooLong && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-center justify-between gap-2">
                <span className="text-[11px] text-rose-300 flex items-center gap-1 leading-snug">
                  <span className="material-symbols-outlined text-xs shrink-0">warning</span>
                  <span>
                    Câu thoại có <strong>{wordCount} từ</strong>. Video {form.durationSeconds}s chỉ kịp đọc khoảng 10-12 từ rồi bị ngắt. Cần tối thiểu <strong>{recommendedDuration}s</strong> để nói trọn câu!
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, durationSeconds: recommendedDuration })}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Tự động chuyển sang {recommendedDuration}s
                </button>
              </div>
            )}
          </div>

          {/* Trọng tâm sản phẩm & Bối cảnh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
            <div>
              <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-xs">shopping_bag</span>
                Đặc Điểm Nhận Diện Sản Phẩm:
              </label>
              <input
                type="text"
                value={form.productVisualDetails || ''}
                onChange={(e) => setForm({ ...form, productVisualDetails: e.target.value })}
                placeholder="VD: Bao bì màu xanh ngọc, nắp bạc, logo nổi bật..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-xs">videocam</span>
                Góc Quay &amp; Chuyển Động Camera:
              </label>
              <input
                type="text"
                value={form.cameraAngle || ''}
                onChange={(e) => setForm({ ...form, cameraAngle: e.target.value })}
                placeholder="VD: Close-up POV, Macro Pan, Dolly Push-in..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Hệ thống Prompt chi tiết */}
          <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
              <span className="material-symbols-outlined text-amber-400 text-sm">tune</span>
              Hệ Thống Prompt Tối Ưu Cho Google Omni Flash &amp; Nano Banana Pro
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-400">image</span>
                Prompt Tạo Ảnh Phân Cảnh (Nano Banana Pro):
              </label>
              <textarea
                rows={2}
                value={form.imagePrompt}
                onChange={(e) => setForm({ ...form, imagePrompt: e.target.value })}
                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500 font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-indigo-400">movie</span>
                Prompt Tạo Video Chuyển Động (Omni 1.1 Flash):
              </label>
              <textarea
                rows={2}
                value={form.videoPrompt}
                onChange={(e) => setForm({ ...form, videoPrompt: e.target.value })}
                className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500 font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Lưu Toàn Diện Phân Cảnh Này</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};