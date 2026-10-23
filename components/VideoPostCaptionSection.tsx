import React, { useState } from 'react';
import { VideoCaptionData } from '../types';
import { Flow } from 'flow-sdk';

interface VideoPostCaptionSectionProps {
  productName: string;
  productDescription: string;
  targetAudience: string;
  reviewStyle: string;
  captionData: VideoCaptionData | null;
  onUpdateCaptionData: (data: VideoCaptionData) => void;
  isGenerating: boolean;
  onGenerateCaption: () => void;
}

export const VideoPostCaptionSection: React.FC<VideoPostCaptionSectionProps> = ({
  productName,
  captionData,
  onUpdateCaptionData,
  isGenerating,
  onGenerateCaption
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const fullContentToCopy = captionData
    ? `${captionData.title}\n\n${captionData.detailedCaption}\n\n👉 ${captionData.ctaText}\n\n${captionData.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`
    : '';

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCaptionTxt = async () => {
    if (!fullContentToCopy) return;
    try {
      const bytes = new TextEncoder().encode(fullContentToCopy);
      const base64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
      await Flow.download({
        base64,
        mimeType: 'text/plain',
        filename: `Mo_Ta_Hashtag_${productName ? productName.replace(/[^a-zA-Z0-9_\-]/g, '_') : 'Video'}.txt`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddHashtag = (tag: string) => {
    if (!captionData) return;
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag) return;
    if (!captionData.hashtags.includes(cleanTag)) {
      onUpdateCaptionData({
        ...captionData,
        hashtags: [...captionData.hashtags, cleanTag]
      });
    }
  };

  const handleRemoveHashtag = (tagIndex: number) => {
    if (!captionData) return;
    const newTags = [...captionData.hashtags];
    newTags.splice(tagIndex, 1);
    onUpdateCaptionData({
      ...captionData,
      hashtags: newTags
    });
  };

  return (
    <div className="p-4 sm:p-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4 shadow-xl">
      {/* Header khu vực */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-amber-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-xl">tag</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Mô Tả &amp; Hashtag Đăng Video (TikTok, Reels, Shorts)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                Chuẩn Viral SEO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Tạo tiêu đề giật tít, caption bán hàng kích thích click giỏ hàng và bộ thẻ hashtags xu hướng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {captionData && (
            <>
              <button
                type="button"
                onClick={() => handleCopy(fullContentToCopy, 'all')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sao chép toàn bộ tiêu đề, nội dung và hashtags"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">
                  {copiedType === 'all' ? 'check' : 'content_copy'}
                </span>
                <span>{copiedType === 'all' ? 'Đã sao chép!' : 'Sao chép tất cả'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCaptionTxt}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Tải về file text"
              >
                <span className="material-symbols-outlined text-sm text-emerald-400">download</span>
                <span>Tải TXT</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onGenerateCaption}
            disabled={isGenerating}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0 ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-zinc-950 shadow-pink-500/20 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>AI Đang Viết Caption...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>{captionData ? 'Tạo Lại Mô Tả & Hashtag' : 'Tự Động Tạo Mô Tả & Hashtag'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hiển thị nội dung nếu đã có hoặc thông báo trống */}
      {captionData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cột trái: Tiêu đề & Caption mô tả */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">campaign</span>
                  <span>Tiêu Đề Giật Tít / Câu Mở Đầu (Hook Title):</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(captionData.title, 'title')}
                  className="text-[10px] text-zinc-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">
                    {copiedType === 'title' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedType === 'title' ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
              <input
                type="text"
                value={captionData.title}
                onChange={(e) => onUpdateCaptionData({ ...captionData, title: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-pink-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">description</span>
                  <span>Mô Tả Chi Tiết Kèm Lời Kêu Gọi Đặt Hàng (Caption):</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(captionData.detailedCaption, 'desc')}
                  className="text-[10px] text-zinc-400 hover:text-pink-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">
                    {copiedType === 'desc' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedType === 'desc' ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={captionData.detailedCaption}
                onChange={(e) => onUpdateCaptionData({ ...captionData, detailedCaption: e.target.value })}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-pink-500 leading-relaxed font-sans placeholder:text-zinc-600 resize-none"
              />
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  <span>Lời Kêu Gọi Hành Động (CTA):</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(captionData.ctaText, 'cta')}
                  className="text-[10px] text-zinc-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">
                    {copiedType === 'cta' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedType === 'cta' ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
              <input
                type="text"
                value={captionData.ctaText}
                onChange={(e) => onUpdateCaptionData({ ...captionData, ctaText: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Cột phải: Hashtags viral & Thẻ phân loại */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">scatter_plot</span>
                  <span>Danh Sách Hashtags Xu Hướng ({captionData.hashtags.length}):</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(captionData.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' '), 'tags')}
                  className="text-[10px] text-zinc-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">
                    {copiedType === 'tags' ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedType === 'tags' ? 'Đã chép' : 'Chép tất cả #'}</span>
                </button>
              </div>

              {/* Danh sách Tags dạng Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[90px] max-h-[160px] overflow-y-auto p-2 bg-zinc-900 rounded-xl border border-zinc-800/80">
                {captionData.hashtags.map((tag, idx) => (
                  <span
                    key={`${tag}_${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-zinc-800 hover:bg-zinc-750 text-cyan-300 border border-cyan-500/30 transition-colors"
                  >
                    <span>#{tag.replace(/^#/, '')}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(idx)}
                      className="text-zinc-500 hover:text-red-400 ml-0.5 cursor-pointer"
                      title="Xóa hashtag này"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Thêm tag thủ công hoặc bấm gợi ý nhanh */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 block">Thêm thẻ gợi ý nhanh:</span>
                <div className="flex flex-wrap gap-1">
                  {['fyp', 'tiktokshop', 'xuhuong', 'review', 'goclamdep', 'affiliate', 'dealhot'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddHashtag(sug)}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      + #{sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Khối hiển thị xem trước cách bài đăng hiển thị trên TikTok/Reels */}
            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-[11px] space-y-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Xem Trước Dạng Bài Đăng Thực Tế:
              </span>
              <p className="text-zinc-300 leading-snug line-clamp-3 font-sans">
                <strong>{captionData.title}</strong> — {captionData.detailedCaption} 👉 {captionData.ctaText}
              </p>
              <p className="text-cyan-400 font-mono text-[10px] truncate">
                {captionData.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-zinc-950/60 rounded-2xl border border-dashed border-zinc-800 text-center space-y-2">
          <span className="material-symbols-outlined text-3xl text-zinc-600">post_add</span>
          <p className="text-xs text-zinc-300 font-semibold">
            Chưa có mô tả &amp; hashtag cho video này.
          </p>
          <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
            Sau khi lên kịch bản hoặc xuất video, hãy bấm nút <strong>&ldquo;Tự Động Tạo Mô Tả &amp; Hashtag&rdquo;</strong> ở trên. AI sẽ tự động phân tích sản phẩm, các phân cảnh và viết sẵn bài đăng hoàn chỉnh để bạn đăng ngay lên TikTok / Reels.
          </p>
        </div>
      )}
    </div>
  );
};