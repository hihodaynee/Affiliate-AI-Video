import React, { useState } from 'react';
import { SceneCard } from '../types';

interface RegenerateFeedbackModalProps {
  scene: SceneCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sceneNumber: number, feedback: string, quickReason: string) => void;
}

const QUICK_REASONS = [
  { id: 'face_mismatch', label: 'Mặt nhân vật chưa khớp ảnh mẫu', promptFix: 'Ensure 100% facial fidelity matching reference face, exact facial structure, hair and eyes.' },
  { id: 'lip_sync', label: 'Khẩu hình nói chưa khớp lời thoại', promptFix: 'Precise and expressive lip synchronization matching the spoken sentence, natural mouth movements.' },
  { id: 'product_mismatch', label: 'Bao bì/logo sản phẩm bị biến dạng', promptFix: 'Lock product packaging identity, retain exact label, typography, colors and shape from reference product.' },
  { id: 'motion_unnatural', label: 'Cử chỉ hoặc tay cầm chưa tự nhiên', promptFix: 'Natural and fluid hand gestures, confident human posture, authentic commercial actor movement.' },
  { id: 'camera_angle', label: 'Góc quay chưa đủ hấp dẫn', promptFix: 'Dynamic high-end commercial cinematography, smooth camera dolly, shallow depth of field.' }
];

export const RegenerateFeedbackModal: React.FC<RegenerateFeedbackModalProps> = ({
  scene,
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen || !scene) return null;

  const [selectedReason, setSelectedReason] = useState<string>(QUICK_REASONS[0].id);
  const [customFeedback, setCustomFeedback] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = QUICK_REASONS.find(r => r.id === selectedReason);
    const combinedFeedback = [
      reasonObj ? reasonObj.promptFix : '',
      customFeedback.trim()
    ].filter(Boolean).join('. ');

    onSubmit(scene.sceneNumber, combinedFeedback, reasonObj ? reasonObj.label : 'Tùy chỉnh');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
              <span className="material-symbols-outlined text-base">refresh</span>
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Tạo Lại Video Cảnh #{scene.sceneNumber}</h3>
              <p className="text-xs text-amber-400 font-mono">{scene.stageName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
            <label className="text-xs font-bold text-zinc-200 block mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-sm">psychology</span>
              <span>Vì sao bạn muốn tạo lại video này? (Chọn lý do chính):</span>
            </label>
            <div className="space-y-1.5">
              {QUICK_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <label
                    key={reason.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 text-amber-200'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="regenerate_reason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 accent-amber-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold block text-zinc-100">{reason.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{reason.promptFix}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-cyan-400 text-sm">edit_note</span>
                Ý kiến đóng góp cụ thể của bạn (Tùy chọn):
              </span>
              <span className="text-[10px] text-zinc-500">Giúp AI bám sát ý bạn</span>
            </label>
            <textarea
              rows={3}
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
              placeholder="VD: Muốn nụ cười rạng rỡ hơn, đưa sản phẩm cao hơn một chút, ánh sáng ấm hơn..."
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-hidden focus:border-amber-500 leading-relaxed font-sans placeholder:text-zinc-600"
            />
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
              <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
              <span>Áp Dụng Ý Kiến &amp; Tạo Lại Video</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};