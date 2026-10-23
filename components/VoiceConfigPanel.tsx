import React from 'react';
import { VoiceRegion, VoiceGender, VoiceTone } from '../types';
import { VOICE_REGIONS, VOICE_GENDERS, VOICE_TONES, buildDetailedVoicePrompt } from '../constants';

interface VoiceConfigPanelProps {
  selectedRegion: VoiceRegion;
  onRegionChange: (region: VoiceRegion) => void;
  selectedGender: VoiceGender;
  onGenderChange: (gender: VoiceGender) => void;
  selectedTone: VoiceTone;
  onToneChange: (tone: VoiceTone) => void;
  customVoiceNotes: string;
  onCustomVoiceNotesChange: (val: string) => void;
}

export const VoiceConfigPanel: React.FC<VoiceConfigPanelProps> = ({
  selectedRegion,
  onRegionChange,
  selectedGender,
  onGenderChange,
  selectedTone,
  onToneChange,
  customVoiceNotes,
  onCustomVoiceNotesChange
}) => {
  const currentRegion = VOICE_REGIONS.find(r => r.id === selectedRegion) || VOICE_REGIONS[0];
  const currentGender = VOICE_GENDERS.find(g => g.id === selectedGender) || VOICE_GENDERS[0];
  const detailedPrompt = buildDetailedVoicePrompt(selectedRegion, selectedGender, selectedTone);

  return (
    <div className="p-4 sm:p-5 bg-zinc-950/90 border border-amber-500/30 rounded-3xl space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
            <span className="material-symbols-outlined text-lg">record_voice_over</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Thiết Lập Giọng Đọc AI &amp; Khóa Đồng Nhất Âm Sắc
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Chống Lệch Giọng
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Chọn vùng miền (Hà Nội, TP.HCM, Miền Trung) và giới tính (Nam/Nữ) để mô tả âm vực chuẩn xác cho AI qua từng video.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800 shrink-0">
          <span className="material-symbols-outlined text-sm text-emerald-400">lock</span>
          <span className="font-semibold">{currentRegion.label}</span>
          <span>•</span>
          <span className="font-semibold">{currentGender.id === 'female' ? 'Nữ' : 'Nam'}</span>
        </div>
      </div>

      {/* 1. Lựa chọn Vùng Miền */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-400 text-sm">map</span>
          <span>1. Vùng Miền &amp; Thổ Ngữ (Accents):</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {VOICE_REGIONS.map((region) => {
            const isSelected = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onRegionChange(region.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/50 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-amber-400">{region.icon}</span>
                      <span>{region.label}</span>
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 font-semibold">
                      {region.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                    {region.description}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono">
                  {region.features}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Lựa chọn Giới Tính & Tông Giọng */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1">
        {/* Giới tính */}
        <div className="md:col-span-4 space-y-2">
          <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-400 text-sm">transgender</span>
            <span>2. Giới Tính Giọng Đọc:</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {VOICE_GENDERS.map((gender) => {
              const isSelected = selectedGender === gender.id;
              return (
                <button
                  key={gender.id}
                  type="button"
                  onClick={() => onGenderChange(gender.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="material-symbols-outlined text-base text-indigo-400">{gender.icon}</span>
                    <span>{gender.id === 'female' ? 'Nữ (Female)' : 'Nam (Male)'}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                    {gender.timbreDescription}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tông giọng & Cảm xúc */}
        <div className="md:col-span-8 space-y-2">
          <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-pink-400 text-sm">sentiment_satisfied</span>
            <span>3. Tông Giọng &amp; Sắc Thái Biểu Cảm:</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VOICE_TONES.map((tone) => {
              const isSelected = selectedTone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => onToneChange(tone.id as VoiceTone)}
                  className={`p-2 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-400 text-pink-200 font-bold ring-1 ring-pink-500/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-[11px] text-white font-bold truncate">{tone.label}</div>
                  <div className="text-[9px] text-zinc-500 line-clamp-1 mt-0.5">{tone.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Mô tả chi tiết âm học tự sinh chống lệch giọng */}
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs">tune</span>
            <span>Chuỗi Mô Tả Âm Học Chi Tiết Được Áp Đặt Cho Video (Acoustic Lock):</span>
          </label>
          <span className="text-[10px] text-emerald-400 font-mono">Tự Động Đồng Bộ 100% Cả 5 Cảnh</span>
        </div>

        <p className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 text-[11px] text-zinc-300 font-mono leading-relaxed select-all">
          {detailedPrompt}
        </p>

        <div className="pt-1">
          <input
            type="text"
            value={customVoiceNotes}
            onChange={(e) => onCustomVoiceNotesChange(e.target.value)}
            placeholder="Ghi chú thêm về chất giọng (VD: giọng hơi khàn nhẹ quyến rũ, nói nhanh nhí nhảnh, giọng ấm áp trầm lắng...)"
            className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 placeholder:text-zinc-600 font-sans"
          />
        </div>
      </div>
    </div>
  );
};