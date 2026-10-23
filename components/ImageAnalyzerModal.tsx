import React, { useState } from 'react';
import { Flow } from 'flow-sdk';
import { CharacterAttributes } from '../types';

interface ImageAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAttributes: (analyzed: Partial<CharacterAttributes>) => void;
}

export const ImageAnalyzerModal: React.FC<ImageAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApplyAttributes
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectImageFromFlow = async () => {
    try {
      const media = await Flow.media.select({ filter: 'image' });
      if (media) {
        setSelectedImage({
          base64: media.base64,
          mimeType: media.mimeType,
          name: media.name || 'Ảnh Mẫu'
        });
        setAnalysisError(null);
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError('Không thể mở thư viện chọn ảnh.');
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const promptText = 
        `Hãy phân tích bức ảnh chân dung nhân vật này một cách toàn diện và trích xuất các thuộc tính thẩm mỹ chính xác để phục vụ tạo AI Influencer.\n` +
        `Yêu cầu: Trả về ĐÚNG MỘT OBJECT JSON thuần túy (không markdown, không bọc backtick giải thích) với các trường sau:\n` +
        `{\n` +
        `  "gender": "female" hoặc "male" hoặc "non-binary",\n` +
        `  "age": số nguyên từ 18-65,\n` +
        `  "ethnicity": "Vietnamese" hoặc nguồn gốc tương đồng phù hợp,\n` +
        `  "bodyType": "mô tả thể chất ngắn gọn",\n` +
        `  "skinTone": "mô tả tone da và kết cấu da",\n` +
        `  "hairStyle": "kiểu tóc chính xác",\n` +
        `  "hairColor": "màu tóc chính xác",\n` +
        `  "eyeColor": "màu mắt và dáng mắt",\n` +
        `  "facialFeatures": "đặc điểm khuôn mặt nổi bật",\n` +
        `  "makeupStyle": "phong cách trang điểm",\n` +
        `  "professionOrVibe": "nghề nghiệp / phong cách influencer",\n` +
        `  "outfit": "trang phục nhân vật đang mặc",\n` +
        `  "accessories": "phụ kiện hoặc trang sức",\n` +
        `  "expression": "biểu cảm và ánh mắt",\n` +
        `  "setting": "bối cảnh không gian xung quanh",\n` +
        `  "lighting": "ánh sáng nhiếp ảnh",\n` +
        `  "otherFeatures": "các đặc điểm nhận diện độc đáo khác"\n` +
        `}`;

      const res = await Flow.generate.text(promptText, {
        images: [{ base64: selectedImage.base64, mimeType: selectedImage.mimeType }],
        systemInstruction: 'You are an expert AI portrait stylist and computer vision analyst. Output strictly valid JSON object representing the character traits.'
      });

      let jsonStr = res.text.trim();
      jsonStr = jsonStr.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

      const parsed = JSON.parse(jsonStr);

      onApplyAttributes({
        gender: parsed.gender || 'female',
        age: Number(parsed.age) || 23,
        ethnicity: parsed.ethnicity || 'Vietnamese',
        bodyType: parsed.bodyType || 'Slim athletic',
        skinTone: parsed.skinTone || 'Fair smooth skin with natural texture',
        hairStyle: parsed.hairStyle || 'Long soft voluminous waves',
        hairColor: parsed.hairColor || 'Warm dark chocolate brown',
        eyeColor: parsed.eyeColor || 'Warm dark brown eyes',
        facialFeatures: parsed.facialFeatures || 'Soft delicate features',
        makeupStyle: parsed.makeupStyle || 'Clean girl no-makeup dewy glow',
        professionOrVibe: parsed.professionOrVibe || 'Fashion & Beauty UGC Creator',
        outfit: parsed.outfit || 'Chic casual outfit',
        accessories: parsed.accessories || 'Minimalist dainty jewelry',
        expression: parsed.expression || 'Gentle confident smile with direct eye contact',
        setting: parsed.setting || 'Modern aesthetic interior',
        lighting: parsed.lighting || 'Soft natural window light',
        otherFeatures: parsed.otherFeatures || ''
      });

      onClose();
    } catch (err: any) {
      console.error('Lỗi phân tích hình ảnh AI:', err);
      setAnalysisError(err.message || 'Không thể phân tích ảnh bằng AI. Vui lòng thử lại với ảnh rõ mặt hơn.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-2xl">document_scanner</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Phân Tích Hình Ảnh Bằng AI</h3>
            <p className="text-xs text-amber-400/90 font-mono">Tự động trích xuất thuộc tính nhân vật từ ảnh mẫu</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Chọn bất kỳ bức ảnh chân dung nhân vật yêu thích nào từ thư viện của bạn. Hệ thống AI Vision sẽ tự động phân tích khuôn mặt, vóc dáng, màu da, kiểu tóc, phong cách thời trang, bối cảnh và ánh sáng, sau đó tự động điền vào các trường trong studio để bạn tạo nên nhân vật tương tự.
        </p>

        {/* Khu vực chọn ảnh */}
        <div className="mb-4">
          {selectedImage ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800 group">
              <img
                src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`}
                alt="Selected Sample"
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleSelectImageFromFlow}
                className="absolute inset-0 bg-black/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-semibold text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">sync</span>
                <span>Chọn ảnh mẫu khác</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSelectImageFromFlow}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-amber-500/60 bg-zinc-950/60 hover:bg-zinc-900 transition-all flex flex-col items-center justify-center gap-2 text-center p-6 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-400 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
              </div>
              <p className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                Chọn ảnh mẫu từ thư viện Google Flow
              </p>
              <p className="text-[10px] text-zinc-500">
                Hỗ trợ ảnh chân dung JPG, PNG, WebP sắc nét
              </p>
            </button>
          )}
        </div>

        {analysisError && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{analysisError}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleAnalyzeWithAI}
            disabled={!selectedImage || isAnalyzing}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              !selectedImage || isAnalyzing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/20 cursor-pointer active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>AI Đang Phân Tích Thuộc Tính...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">auto_fix_high</span>
                <span>Phân Tích &amp; Điền Tự Động</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};