import React from 'react';
import { CharacterAttributes, Gender } from '../types';
import {
  ETHNICITY_OPTIONS,
  BODY_TYPE_OPTIONS,
  SKIN_TONE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
  MAKEUP_STYLE_OPTIONS,
  PROFESSION_OPTIONS,
  OUTFIT_OPTIONS,
  EXPRESSION_OPTIONS,
  SETTING_OPTIONS,
  LIGHTING_OPTIONS,
  CAMERA_LENS_OPTIONS
} from '../constants';

interface AttributesFormProps {
  attributes: CharacterAttributes;
  onChange: (updated: CharacterAttributes) => void;
  onResetToDefault: () => void;
}

export const AttributesForm: React.FC<AttributesFormProps> = ({
  attributes,
  onChange,
  onResetToDefault
}) => {
  const updateField = <K extends keyof CharacterAttributes>(field: K, value: CharacterAttributes[K]) => {
    onChange({
      ...attributes,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Nhân khẩu học & Nhận diện */}
      <section className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg">badge</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              1. Nhân Khẩu Học &amp; Nhận Diện
            </h3>
          </div>
          <button
            onClick={onResetToDefault}
            className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            title="Đặt lại thông số mặc định"
          >
            <span className="material-symbols-outlined text-xs">restart_alt</span>
            <span>Đặt lại mặc định</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Giới tính */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Giới tính:
            </label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['female', 'male', 'non-binary'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('gender', g)}
                  className={`py-1 text-center rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    attributes.gender === g
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {g === 'female' ? 'Nữ' : g === 'male' ? 'Nam' : 'Khác'}
                </button>
              ))}
            </div>
          </div>

          {/* Độ tuổi */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-zinc-300">
                Độ tuổi:
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">{attributes.age} tuổi</span>
            </div>
            <input
              type="range"
              min={18}
              max={60}
              value={attributes.age}
              onChange={(e) => updateField('age', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Nguồn gốc / Quốc gia */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Nguồn gốc / Sắc tộc:
            </label>
            <select
              value={attributes.ethnicity}
              onChange={(e) => updateField('ethnicity', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {ETHNICITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Vóc dáng */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Vóc dáng / Thể chất:
            </label>
            <select
              value={attributes.bodyType}
              onChange={(e) => updateField('bodyType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {BODY_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Làn da */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Màu da &amp; Kết cấu làn da:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SKIN_TONE_OPTIONS.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => updateField('skinTone', tone)}
                className={`px-2.5 py-1 rounded-xl text-[11px] border transition-all cursor-pointer ${
                  attributes.skinTone === tone
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Khuôn mặt, Mái tóc & Trang điểm */}
      <section className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <span className="material-symbols-outlined text-amber-400 text-lg">face_3</span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            2. Khuôn Mặt, Mái Tóc &amp; Trang Điểm
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Kiểu tóc */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Kiểu tóc:
            </label>
            <select
              value={attributes.hairStyle}
              onChange={(e) => updateField('hairStyle', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {HAIR_STYLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Màu tóc */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Màu tóc:
            </label>
            <select
              value={attributes.hairColor}
              onChange={(e) => updateField('hairColor', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {HAIR_COLOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Màu mắt */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Màu mắt &amp; Dáng mắt:
            </label>
            <select
              value={attributes.eyeColor}
              onChange={(e) => updateField('eyeColor', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {EYE_COLOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phong cách trang điểm */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Phong cách trang điểm (Makeup):
            </label>
            <select
              value={attributes.makeupStyle}
              onChange={(e) => updateField('makeupStyle', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {MAKEUP_STYLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Biểu cảm khuôn mặt */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Biểu cảm &amp; Ánh mắt:
            </label>
            <select
              value={attributes.expression}
              onChange={(e) => updateField('expression', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {EXPRESSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. Thời trang, Nghề nghiệp & Bối cảnh */}
      <section className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <span className="material-symbols-outlined text-amber-400 text-lg">checkroom</span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            3. Nghề Nghiệp, Thời Trang &amp; Bối Cảnh
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Nghề nghiệp / Định hướng */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Nghề nghiệp / Định vị nhân vật:
            </label>
            <select
              value={attributes.professionOrVibe}
              onChange={(e) => updateField('professionOrVibe', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {PROFESSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Trang phục chính */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Phong cách trang phục:
            </label>
            <select
              value={attributes.outfit}
              onChange={(e) => updateField('outfit', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {OUTFIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Bối cảnh không gian */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Bối cảnh / Địa điểm:
            </label>
            <select
              value={attributes.setting}
              onChange={(e) => updateField('setting', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {SETTING_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Ánh sáng */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Ánh sáng nhiếp ảnh:
            </label>
            <select
              value={attributes.lighting}
              onChange={(e) => updateField('lighting', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {LIGHTING_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ống kính & Tỉ lệ khung hình */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Ống kính &amp; Thẩm mỹ nhiếp ảnh:
            </label>
            <select
              value={attributes.cameraLens}
              onChange={(e) => updateField('cameraLens', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {CAMERA_LENS_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Tỉ lệ khung hình:
            </label>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['9:16', '1:1', '16:9', '3:4', '4:3'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateField('aspectRatio', r)}
                  className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    attributes.aspectRatio === r
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Other Features (Mô tả riêng của người dùng) */}
      <section className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-400 text-base">edit_note</span>
            4. Other Features (Đặc Điểm Nhận Diện Riêng)
          </label>
          <span className="text-[10px] text-zinc-500 font-mono">Tùy biến không giới hạn</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Bổ sung chi tiết nhận diện cá nhân như hình xăm nhỏ ở xương quai xanh, nốt ruồi duyên, kính mắt gọng kim loại, kiểu tạo dáng riêng...
        </p>
        <textarea
          rows={2}
          value={attributes.otherFeatures}
          onChange={(e) => updateField('otherFeatures', e.target.value)}
          placeholder="VD: Small delicate beauty mark near left eye, wearing a thin silver watch, holding a coffee cup..."
          className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 placeholder:text-zinc-600 leading-relaxed font-sans"
        />
      </section>
    </div>
  );
};