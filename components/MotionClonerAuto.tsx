import React, { useState, useRef, useEffect } from 'react';
import { MediaAsset } from '../types';
import { MediaUploader } from './MediaUploader';
import { MOTION_PRESETS } from '../constants';
import { Flow } from 'flow-sdk';
import { generateMotionVideo } from '../services/motionGeneration';
import { requireRemoteMedia, mediaPreview } from '../utils/media';
import { withTimeout } from '../utils/async';

interface MotionClonerAutoProps {
  sourceVideoAsset: MediaAsset | null;
  characterAsset: MediaAsset | null;
  outfitAsset: MediaAsset | null;

  onSelectSourceVideo: () => void;
  onClearSourceVideo: () => void;
  onSelectCharacter: () => void;
  onClearCharacter: () => void;
  onSelectOutfit: () => void;
  onClearOutfit: () => void;
  onUploadSourceVideo?: (asset: MediaAsset) => void;
  onUploadCharacter?: (asset: MediaAsset) => void;
  onUploadOutfit?: (asset: MediaAsset) => void;

  selectedVideoModel: string;
  onVideoModelChange: (model: string) => void;
  selectedImageModel: string;
  onImageModelChange: (model: string) => void;
  resolution: '360p' | '720p';
  onResolutionChange: (res: '360p' | '720p') => void;

  onAddResultVideo: (asset: MediaAsset) => void;
}

export type AutoPipelineStage = 
  | 'idle' 
  | 'analyzing_motion'
  | 'fitting_character'
  | 'generating_video'
  | 'completed'
  | 'error';

export const MotionClonerAuto: React.FC<MotionClonerAutoProps> = ({
  sourceVideoAsset,
  characterAsset,
  outfitAsset,
  onSelectSourceVideo,
  onClearSourceVideo,
  onSelectCharacter,
  onClearCharacter,
  onSelectOutfit,
  onClearOutfit,
  onUploadSourceVideo,
  onUploadCharacter,
  onUploadOutfit,
  selectedVideoModel,
  selectedImageModel,
  resolution,
  onResolutionChange,
  onAddResultVideo
}) => {
  const [pipelineStage, setPipelineStage] = useState<AutoPipelineStage>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [elapsedRenderSeconds, setElapsedRenderSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [motionAnalysis, setMotionAnalysis] = useState<string>('');
  const [intermediateFittedChar, setIntermediateFittedChar] = useState<MediaAsset | null>(null);
  const [resultVideo, setResultVideo] = useState<MediaAsset | null>(null);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [motionVibe, setMotionVibe] = useState<string>('catwalk');
  const [customMotionPrompt, setCustomMotionPrompt] = useState<string>('');
  const [reenactmentMode, setReenactmentMode] = useState<'v2v_edit' | 'r2v_motion'>('v2v_edit');
  const [autoEnhanceQuality, setAutoEnhanceQuality] = useState<boolean>(true);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');

  const renderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const [resultMode, setResultMode] = useState<typeof reenactmentMode>('v2v_edit');

  useEffect(() => {
    return () => {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    };
  }, []);

  const hasMinResources = Boolean(sourceVideoAsset && characterAsset);

  const handleClickStartPipeline = () => {
    if (!sourceVideoAsset) {
      setErrorMessage('Chưa có Video Mẫu Chuyển Động! Vui lòng chọn một video MP4 (dưới 10s) để AI sao chép cử chỉ.');
      onSelectSourceVideo();
      return;
    }
    if (!characterAsset) {
      setErrorMessage('Chưa có Ảnh Nhân Vật KOC! Vui lòng chọn chân dung nhân vật để áp vào video.');
      onSelectCharacter();
      return;
    }
    handleRunAutoPipeline();
  };

  const handleRunAutoPipeline = async () => {
    if (!sourceVideoAsset || !characterAsset || runningRef.current) return;
    runningRef.current = true;
    setIntermediateFittedChar(null); setResultVideo(null); setMotionAnalysis('');

    if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    setElapsedRenderSeconds(0);
    setPipelineStage('analyzing_motion');
    setErrorMessage(null);
    setProgressPercent(15);
    setStatusMessage('Đang phân tích cử chỉ, vóc dáng và góc máy chuyển động từ video mẫu...');

    try {
      requireRemoteMedia(characterAsset, 'Ảnh nhân vật');
      if (outfitAsset) requireRemoteMedia(outfitAsset, 'Ảnh trang phục');
      let detectedMotionDescription = '';
      try {
        const analysisPrompt = 
          'Phân tích chuyển động chính trong video mẫu: ' +
          'Nhân vật đang làm gì (bước đi catwalk, dạo phố, quay người, khiêu vũ...)? ' +
          'Hãy viết thành 1 câu chỉ dẫn chuyển động tiếng Anh ngắn gọn, rõ ràng (dưới 30 từ) để áp dụng cho AI video reenactment.';

        const aiAnalysis = await withTimeout(Flow.generate.text(analysisPrompt, {
          videos: [{ base64: sourceVideoAsset.base64, mimeType: sourceVideoAsset.mimeType, fps: 1 }],
          systemInstruction: 'You are an expert motion capture analyst. Return a concise, vivid English motion directive.'
        }));

        if (aiAnalysis && aiAnalysis.text && aiAnalysis.text.trim()) {
          detectedMotionDescription = aiAnalysis.text.trim();
          setMotionAnalysis(detectedMotionDescription);
        }
      } catch (analError) {
        console.warn('AI Vision video analysis fallback:', analError);
        const fallbackPreset = MOTION_PRESETS.find(p => p.id === motionVibe);
        detectedMotionDescription = fallbackPreset ? fallbackPreset.promptAddon : 'The character smoothly replicates the body posture, walking pace, and camera angle of the source video.';
        setMotionAnalysis(detectedMotionDescription);
      }

      if (!detectedMotionDescription) {
        const fallbackPreset = MOTION_PRESETS.find(p => p.id === motionVibe);
        detectedMotionDescription = fallbackPreset ? fallbackPreset.promptAddon : 'Smooth commercial motion tracking the original video dynamics.';
      }

      let readyCharacterMediaId = characterAsset.mediaId;

      if (outfitAsset) {
        setPipelineStage('fitting_character');
        setProgressPercent(45);
        setStatusMessage('Đang ghép trang phục mới cho nhân vật KOC trước khi sao chép chuyển động...');

        try {
          const fitPrompt = 
            'Masterpiece commercial fashion photo. Seamlessly dress the person from reference 1 with the exact clothing design, fabric textures, colors and accessories from reference 2. ' +
            'Maintain 100% facial features, identity, hairstyle and body shape identical to reference 1. Pristine studio lighting, clean background, 8k commercial photography.';

          const fittedImageResult = await withTimeout(Flow.generate.image({
            prompt: fitPrompt,
            referenceImageMediaIds: [characterAsset.mediaId, outfitAsset.mediaId],
            modelDisplayName: selectedImageModel,
            aspectRatio: '9:16'
          }));

          const fittedAsset: MediaAsset = {
            mediaId: fittedImageResult.mediaId,
            base64: fittedImageResult.base64,
            mimeType: fittedImageResult.mimeType,
            name: 'Nhan_Vat_Da_Ghep_Trang_Phuc',
            type: 'image',
            previewUrl: `data:${fittedImageResult.mimeType};base64,${fittedImageResult.base64}`
          };
          setIntermediateFittedChar(fittedAsset);
          readyCharacterMediaId = fittedAsset.mediaId;
        } catch (fitErr: any) {
          throw new Error('Không thể ghép trang phục đã chọn. Hãy thử lại hoặc bỏ ảnh trang phục trước khi tiếp tục.');
        }
      }

      setPipelineStage('generating_video');
      setProgressPercent(75);
      setStatusMessage(`Đang render video với ${selectedVideoModel}... Quá trình này cần khoảng 1 đến 2 phút.`);

      let secCounter = 0;
      renderTimerRef.current = setInterval(() => {
        secCounter += 1;
        setElapsedRenderSeconds(secCounter);
        setProgressPercent(prev => {
          if (prev < 95) {
            return Math.min(95, prev + (secCounter < 40 ? 1 : 0.5));
          }
          return prev;
        });
        if (secCounter === 30) {
          setStatusMessage(`Đang tái tạo khung hình chuyển động với ${selectedVideoModel}... (30s)`);
        } else if (secCounter === 60) {
          setStatusMessage(`Đang hoàn thiện các cử chỉ chi tiết và ánh sáng... (60s)`);
        } else if (secCounter === 90) {
          setStatusMessage(`Gần hoàn thành, đang mã hóa video chất lượng cao... (90s)`);
        }
      }, 1000);

      const motionGuidePrompt = customMotionPrompt.trim() ? customMotionPrompt : detectedMotionDescription;
      const finalPrompt = 
        `Precise commercial motion reenactment. ` +
        `Replicate the motion dynamics, body gestures, posture, and pacing: ${motionGuidePrompt}. ` +
        `Subject Identity: The character must have the exact face, skin tone, hair, and clothing from the reference image without morphing or distortion. ` +
        `${autoEnhanceQuality ? 'High-end cinema lighting, sharp motion blur, consistent frame continuity, pristine commercial master quality.' : ''}`;

      const videoResult = await generateMotionVideo({ mode: reenactmentMode, source: sourceVideoAsset,
        characterId: readyCharacterMediaId, prompt: finalPrompt, model: selectedVideoModel, resolution });

      if (renderTimerRef.current) clearInterval(renderTimerRef.current);

      if (!videoResult || !videoResult.base64) {
        throw new Error('Hệ thống không nhận được dữ liệu video trả về.');
      }

      const videoBlobUrl = mediaPreview(videoResult);

      const generatedAsset: MediaAsset = {
        mediaId: videoResult.mediaId,
        base64: videoResult.base64,
        mimeType: videoResult.mimeType || 'video/mp4',
        name: `Video_Sao_Chep_Chuyen_Dong_${Date.now()}`,
        type: 'video',
        previewUrl: videoBlobUrl
      };

      setResultMode(reenactmentMode);
      setResultVideo(generatedAsset);
      onAddResultVideo(generatedAsset);
      setProgressPercent(100);
      setPipelineStage('completed');
      setStatusMessage(reenactmentMode === 'v2v_edit' ? 'Đã tạo video từ video mẫu. Hãy kiểm tra chuyển động trong kết quả.' : 'Đã tạo video mô phỏng từ ảnh và mô tả. Chế độ này không giữ chính xác chuyển động của video mẫu.');

    } catch (err: any) {
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
      console.error('Lỗi quy trình sao chép chuyển động:', err);
      setPipelineStage('error');
      
      let friendlyError = err instanceof Error ? err.message : 'Có lỗi xảy ra trong quá trình render video.';
      if (friendlyError.includes('sourceVideo') || friendlyError.includes('duration') || friendlyError.includes('maximum 10s')) {
        friendlyError = 'Video mẫu của bạn có thể dài hơn 10 giây hoặc định dạng chưa tương thích. Vui lòng chọn video mẫu ngắn dưới 10 giây hoặc chuyển sang chế độ "Mô Phỏng Cử Chỉ (R2V)" trong Tùy Chỉnh Nâng Cao.';
      } else if (friendlyError.includes('timeout') || friendlyError.includes('network')) {
        friendlyError = 'Quá trình render bị gián đoạn mạng hoặc hết thời gian chờ. Bạn có thể bấm thử lại với độ phân giải 360p để xử lý nhanh hơn.';
      }
      setErrorMessage(friendlyError);
    } finally {
      runningRef.current = false;
      if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    }
  };

  const handleDownloadVideo = async () => {
    if (!resultVideo) return;
    setDownloadState('downloading');
    try {
      await Flow.download({
        base64: resultVideo.base64,
        mimeType: 'video/mp4',
        filename: `${resultVideo.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mp4`
      });
      setDownloadState('done');
      setTimeout(() => setDownloadState('idle'), 2500);
    } catch {
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    setPipelineStage('idle');
    setStatusMessage('');
    setProgressPercent(0);
    setElapsedRenderSeconds(0);
    setErrorMessage(null);
  };

  const isOperating = pipelineStage === 'analyzing_motion' || pipelineStage === 'fitting_character' || pipelineStage === 'generating_video';

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-full">
      {/* Banner Giới Thiệu Chế Độ Sao Chép Chuyển Động */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-pink-500/15 border border-amber-500/30 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20 shrink-0 mt-0.5 sm:mt-0">
            <span className="material-symbols-outlined text-2xl font-black">directions_bike</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-white tracking-wide truncate">
              Sao Chép Chuyển Động Video
            </h2>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Nạp <strong>Video Mẫu Chuyển Động (dưới 10 giây)</strong> và <strong>Ảnh Nhân Vật KOC</strong>. Hệ thống tự động phân tích nhịp bước AI Vision, giữ trọn gương mặt và sao chép toàn bộ cử chỉ vào video mới.
            </p>
          </div>
        </div>

        {/* Nút Kích Hoạt Sao Chép Chuyển Động */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          {pipelineStage === 'error' && (
            <button
              onClick={handleReset}
              className="px-3.5 py-3 rounded-2xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer shrink-0"
            >
              Đặt Lại
            </button>
          )}

          <button
            onClick={handleClickStartPipeline}
            disabled={isOperating}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs md:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer whitespace-nowrap ${
              isOperating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : hasMinResources
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-amber-500/25 active:scale-[0.98] ring-2 ring-amber-400/80'
                : 'bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-amber-500/40 hover:border-amber-400'
            }`}
          >
            {isOperating ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Đang Xử Lý ({Math.round(progressPercent)}% • {elapsedRenderSeconds}s)...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg shrink-0">auto_awesome</span>
                <span>
                  {!sourceVideoAsset 
                    ? 'Chọn Video Mẫu Để Bắt Đầu' 
                    : !characterAsset 
                    ? 'Chọn Ảnh Nhân Vật KOC' 
                    : (resultVideo ? 'Sao Chép Lại Video' : 'Sao Chép Chuyển Động (Sẵn sàng)')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid 2 Cột chính: Tối giản không cài đặt model thừa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* CỘT TRÁI: Đầu vào & Cấu hình */}
        <div className="lg:col-span-7 space-y-5 min-w-0 w-full">
          <div className="p-4 sm:p-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-amber-400 text-lg shrink-0">upload_file</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                  Tài Nguyên Đầu Vào ({hasMinResources ? 'Đã Đủ 2/2 ✓' : 'Cần Nạp Đủ 2 Mục'})
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
                {(['720p', '360p'] as const).map(res => (
                  <button
                    key={res}
                    onClick={() => onResolutionChange(res)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      resolution === res ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                    }`}
                    title={res === '360p' ? 'Render nhanh hơn' : 'Độ nét cao'}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid 3 ô tài nguyên đầu vào */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 items-stretch w-full">
              <div className="relative flex flex-col h-full min-w-0">
                <div className={`absolute -top-2.5 left-3 z-10 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-sm border ${
                  sourceVideoAsset 
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                    : 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
                }`}>
                  {sourceVideoAsset ? 'VIDEO MẪU ✓' : 'BẮT BUỘC #1'}
                </div>
                <div className="flex-1 flex flex-col pt-1">
                  <MediaUploader
                    label="Video Mẫu Chuyển Động"
                    sublabel="MP4 dưới 10s (4-8s)"
                    icon="movie"
                    asset={sourceVideoAsset}
                    filter="video"
                    onSelect={onSelectSourceVideo}
                    onClear={onClearSourceVideo}
                    onUploadFile={onUploadSourceVideo}
                  />
                </div>
              </div>

              <div className="relative flex flex-col h-full min-w-0">
                <div className={`absolute -top-2.5 left-3 z-10 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-sm border ${
                  characterAsset 
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                    : 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
                }`}>
                  {characterAsset ? 'NHÂN VẬT ✓' : 'BẮT BUỘC #2'}
                </div>
                <div className="flex-1 flex flex-col pt-1">
                  <MediaUploader
                    label="Ảnh Nhân Vật KOC"
                    sublabel="Giữ nét mặt, vóc dáng"
                    icon="account_circle"
                    asset={characterAsset}
                    filter="image"
                    onSelect={onSelectCharacter}
                    onClear={onClearCharacter}
                    onUploadFile={onUploadCharacter}
                  />
                </div>
              </div>

              <div className="relative flex flex-col h-full min-w-0 sm:col-span-2 md:col-span-1">
                <div className="absolute -top-2.5 left-3 z-10 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300 font-mono border border-zinc-700 shadow-sm">
                  TÙY CHỌN
                </div>
                <div className="flex-1 flex flex-col pt-1">
                  <MediaUploader
                    label="Trang Phục Mới"
                    sublabel="Ghép đồ giữ nguyên mặt"
                    icon="checkroom"
                    asset={outfitAsset}
                    filter="image"
                    onSelect={onSelectOutfit}
                    onClear={onClearOutfit}
                    onUploadFile={onUploadOutfit}
                  />
                </div>
              </div>
            </div>

            {!hasMinResources && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300">
                <span className="material-symbols-outlined text-base shrink-0">info</span>
                <span className="leading-relaxed">
                  Cần nạp tối thiểu <strong>Video Mẫu Chuyển Động</strong> và <strong>Ảnh Nhân Vật KOC</strong> để bắt đầu sao chép.
                </span>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider truncate">
                <span className="material-symbols-outlined text-amber-400 text-base shrink-0">category</span>
                <span>Gợi Ý Phong Cách Chuyển Động</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium shrink-0"
              >
                <span>{showAdvanced ? 'Thu gọn' : 'Tùy chỉnh nâng cao'}</span>
                <span className="material-symbols-outlined text-sm">
                  {showAdvanced ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MOTION_PRESETS.map((p) => {
                const isSelected = motionVibe === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setMotionVibe(p.id);
                      setCustomMotionPrompt(p.promptAddon);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40 shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{p.icon}</span>
                    <span className="text-xs font-bold text-white leading-tight line-clamp-1">{p.title}</span>
                  </button>
                );
              })}
            </div>

            {showAdvanced && (
              <div className="pt-3 border-t border-zinc-800 space-y-3 animate-fadeIn">
                <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-400 text-xs">tune</span>
                      Chế Độ Sao Chép Chuyển Động:
                    </label>
                    <span className="text-[10px] text-zinc-500">Chọn cách tạo video</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReenactmentMode('v2v_edit')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        reenactmentMode === 'v2v_edit'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="text-xs font-bold">1. Video-to-Video Edit (Mặc định)</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Dùng video mẫu làm đầu vào chỉnh sửa; cần kiểm tra độ khớp chuyển động (yêu cầu video dưới 10s).</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReenactmentMode('r2v_motion')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        reenactmentMode === 'r2v_motion'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="text-xs font-bold">2. Tái Tạo Chuyển Động (R2V Motion)</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Dùng AI mô phỏng lại nhịp chuyển động (dành cho video mẫu dài hơn hoặc khi V2V bị lỗi).</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-300">
                      Prompt Bổ Sung Chỉ Đạo Chuyển Động:
                    </label>
                    <span className="text-[10px] text-zinc-500">Tùy biến tự do</span>
                  </div>
                  <textarea
                    rows={2}
                    value={customMotionPrompt}
                    onChange={(e) => setCustomMotionPrompt(e.target.value)}
                    placeholder="Mô tả thêm nếu muốn điều chỉnh nhịp chuyển động, ánh sáng hoặc góc quay..."
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-amber-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoEnhanceQuality}
                      onChange={(e) => setAutoEnhanceQuality(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span>Tự động tối ưu ánh sáng điện ảnh &amp; khử biến dạng khuôn mặt</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Kết quả & Tiến trình */}
        <div className="lg:col-span-5 space-y-4 min-w-0 w-full">
          <div className="p-4 sm:p-5 bg-zinc-900/70 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">smart_display</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                  Tiến Trình &amp; Video Kết Quả
                </h3>
              </div>

              {resultVideo && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full font-mono font-bold shrink-0">
                  Sẵn Sàng Lưu
                </span>
              )}
            </div>

            {pipelineStage !== 'idle' && (
              <div className="p-3.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span className="font-bold text-white truncate">
                      {pipelineStage === 'analyzing_motion' && 'Giai Đoạn 1: Phân Tích Chuyển Động AI'}
                      {pipelineStage === 'fitting_character' && 'Giai Đoạn 2: Ghép Trang Phục Mới'}
                      {pipelineStage === 'generating_video' && `Giai Đoạn 3: Render Video (${elapsedRenderSeconds}s)`}
                      {pipelineStage === 'completed' && 'Hoàn Tất 100%'}
                      {pipelineStage === 'error' && 'Gặp Sự Cố'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 shrink-0">{Math.round(progressPercent)}%</span>
                </div>

                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      pipelineStage === 'error'
                        ? 'bg-red-500'
                        : pipelineStage === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-amber-500 to-amber-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  {statusMessage}
                </p>

                {motionAnalysis && (
                  <div className="p-2 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 space-y-0.5 font-mono">
                    <span className="text-amber-400 font-bold block">Phân Tích Cử Chỉ AI Vision:</span>
                    <p className="line-clamp-2">{motionAnalysis}</p>
                  </div>
                )}
              </div>
            )}

            {/* Khung hiển thị Video Kết Quả */}
            <div className="w-full rounded-2xl overflow-hidden bg-black aspect-[9/14] sm:aspect-[9/13] border border-zinc-800 flex items-center justify-center relative group max-h-[500px]">
              {pipelineStage === 'analyzing_motion' || pipelineStage === 'fitting_character' || pipelineStage === 'generating_video' ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-zinc-200">Đang Xử Lý Sao Chép Chuyển Động...</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed font-mono">
                    {elapsedRenderSeconds > 0 && `Thời gian đã chạy: ${elapsedRenderSeconds} giây`}
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                    Mô hình {selectedVideoModel} đang tính toán lại từng frame để áp nhân vật vào cử chỉ của video gốc.
                  </p>
                </div>
              ) : resultVideo ? (
                <video
                  src={resultVideo.previewUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-zinc-600 space-y-2">
                  <span className="material-symbols-outlined text-5xl">smart_display</span>
                  <p className="text-xs font-semibold">Chưa có video kết quả</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                    Hãy nạp video mẫu và ảnh nhân vật KOC rồi bấm nút &ldquo;Sao Chép Chuyển Động&rdquo;.
                  </p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-200">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>Thông Báo Lỗi:</span>
                </div>
                <p className="leading-relaxed">{errorMessage}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleRunAutoPipeline}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Thử Lại Ngay
                  </button>
                  <button
                    onClick={() => {
                      setReenactmentMode('r2v_motion');
                      setShowAdvanced(true);
                    }}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Đổi Chế Độ R2V Motion
                  </button>
                </div>
              </div>
            )}

            {resultVideo && (
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleDownloadVideo}
                  disabled={downloadState === 'downloading'}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base font-bold">download</span>
                  <span>{downloadState === 'done' ? 'Đã Tải Video Thành Công ✓' : 'Tải Video Sao Chép Về Máy (MP4)'}</span>
                </button>

                <p className="text-[10px] text-center text-zinc-500">
                  {resultMode === 'v2v_edit' ? 'Kết quả dùng video mẫu làm đầu vào.' : 'Kết quả mô phỏng từ ảnh và mô tả, không sao chép chính xác video mẫu.'}
                </p>
              </div>
            )}

            {intermediateFittedChar && (
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-12 bg-black rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                    <img
                      src={intermediateFittedChar.previewUrl}
                      alt="Fitted Char"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">Nhân Vật Đã Ghép Trang Phục</span>
                    <span className="text-[10px] text-zinc-500 font-mono block truncate">Đã dùng làm nguồn video</span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-emerald-400 text-base shrink-0">check_circle</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
