import React, { useState, useRef, useEffect } from 'react';
import { SceneCard, MediaAsset } from '../types';
import { FFmpegService } from '../services/ffmpegService';
import { Flow } from 'flow-sdk';
import { buildConcatArgs } from '../utils/concat';
import { mediaPreview } from '../utils/media';

interface VideoConcatenatorTimelineProps {
  scenes: SceneCard[];
  aspectRatio: '9:16' | '16:9';
  isOpen: boolean;
  onClose: () => void;
  onSaveMergedVideo: (mergedAsset: MediaAsset) => void;
  requireAudio?: boolean;
  preserveOrder?: boolean;
}

export const VideoConcatenatorTimeline: React.FC<VideoConcatenatorTimelineProps> = ({
  scenes,
  aspectRatio,
  isOpen,
  onClose,
  onSaveMergedVideo,
  requireAudio = false,
  preserveOrder = false
}) => {


  // Lấy các phân cảnh đã có video
  const availableClips = scenes
    .filter(s => s.generatedVideo !== null)
    .map(s => ({
      sceneNumber: s.sceneNumber,
      stageName: s.stageName,
      duration: s.durationSeconds || 4,
      dialogue: s.dialogue,
      videoAsset: s.generatedVideo!
    }));

  const [clipOrder, setClipOrder] = useState<typeof availableClips>(availableClips);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [isConcatenating, setIsConcatenating] = useState<boolean>(false);
  const [concatProgress, setConcatProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mergedVideoAsset, setMergedVideoAsset] = useState<MediaAsset | null>(null);
  const [audioPreserveMode, setAudioPreserveMode] = useState<'with_audio' | 'video_only'>('with_audio');

  const ffmpegRef = useRef<FFmpegService | null>(null);
  if (!ffmpegRef.current) ffmpegRef.current = new FFmpegService();
  const ffmpegService = ffmpegRef.current;
  useEffect(() => () => ffmpegService.dispose(), [ffmpegService]);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isConcatenating) { setClipOrder(availableClips); setActivePreviewIndex(0); }
  }, [scenes]);

  const totalDuration = clipOrder.reduce((acc, c) => acc + c.duration, 0);

  useEffect(() => {
    if (isPlayingSequence) videoPlayerRef.current?.play().catch(() => setIsPlayingSequence(false));
  }, [activePreviewIndex, isPlayingSequence]);

  const handleVideoEnded = () => {
    if (isPlayingSequence) {
      if (activePreviewIndex < clipOrder.length - 1) {
        setActivePreviewIndex(prev => prev + 1);
      } else {
        setIsPlayingSequence(false);
        setActivePreviewIndex(0);
      }
    }
  };

  const handleTogglePlaySequence = () => {
    if (isPlayingSequence) {
      setIsPlayingSequence(false);
      videoPlayerRef.current?.pause();
    } else {
      setIsPlayingSequence(true);
      videoPlayerRef.current?.play().catch(() => setIsPlayingSequence(false));
    }
  };

  const moveClip = (index: number, direction: 'left' | 'right') => {
    if (preserveOrder) return;
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= clipOrder.length) return;
    const updated = [...clipOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setClipOrder(updated);
    setActivePreviewIndex(newIdx);
  };

  /**
   * Ghép video an toàn, khắc phục triệt để lỗi Unhandled Promise:
   * 1. Nạp FFmpeg WASM thông qua classic worker.
   * 2. Viết từng clip vào bộ nhớ ảo.
   * 3. Xử lý chuẩn hóa độ phân giải và framerate.
   * 4. Bọc toàn diện trong try/catch/finally với giải phóng bộ nhớ ảo.
   */
  const handleConcatenateVideos = async () => {
    if (clipOrder.length === 0 || isConcatenating) return;
    setIsConcatenating(true);
    setMergedVideoAsset(null);
    setErrorMessage(null);
    setConcatProgress('Khởi động lõi xử lý FFmpeg WASM...');

    const fileNames: string[] = [];

    try {
      await ffmpegService.load((msg) => {
        setConcatProgress(`Đang tải lõi xử lý: ${msg}`);
      });

      setConcatProgress(`Đang nạp ${clipOrder.length} clip vào bộ nhớ ảo...`);

      for (let i = 0; i < clipOrder.length; i++) {
        const clip = clipOrder[i];
        const fileName = `clip_${i}.mp4`;
        fileNames.push(fileName);
        const bytes = Uint8Array.from(atob(clip.videoAsset.base64), c => c.charCodeAt(0));
        await ffmpegService.writeFile(fileName, bytes);
      }

      setConcatProgress(`Đang chuẩn bị ghép nối ${clipOrder.length} clip...`);
      setConcatProgress('Đang ghép video, giữ tỷ lệ khung hình đã chọn...');
      await ffmpegService.exec(buildConcatArgs(fileNames, aspectRatio, requireAudio || audioPreserveMode === 'with_audio'));

      setConcatProgress('Đang đọc video hoàn chỉnh từ bộ nhớ ảo...');
      const outputData = await ffmpegService.readFile('merged_output.mp4') as Uint8Array;
      if (!outputData || outputData.length === 0) {
        throw new Error('Dữ liệu video sau khi ghép rỗng.');
      }

      const blob = new Blob([new Uint8Array(outputData)], { type: 'video/mp4' });


      // Chuyển sang base64 an toàn qua FileReader (tránh call stack limit)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = (reader.result as string)?.split(',')[1];
          if (res) resolve(res);
          else reject(new Error('Không thể trích xuất base64 của video.'));
        };
        reader.onerror = () => reject(new Error('Lỗi đọc blob video.'));
        reader.readAsDataURL(blob);
      });

      const mergedAsset: MediaAsset = {
        mediaId: `merged_${Date.now()}`,
        base64,
        mimeType: 'video/mp4',
        name: `Video_${requireAudio ? 'ASMR' : 'Review'}_${clipOrder.length}_Canh_${Date.now()}`,
        type: 'video',
        previewUrl: mediaPreview({base64, mimeType: 'video/mp4'})
      };

      setMergedVideoAsset(mergedAsset);
      onSaveMergedVideo(mergedAsset);
      setConcatProgress(`Ghép thành công trọn vẹn ${clipOrder.length} clip (${totalDuration}s)! Đã sẵn sàng tải về.`);
    } catch (err: any) {
      console.error('Lỗi khi ghép clip:', err);
      const errMsg = err instanceof Error ? err.message : String(err || '');
      setErrorMessage(`Quá trình ghép gặp sự cố: ${errMsg}. ${requireAudio ? 'ASMR cần âm thanh. Hãy kiểm tra hoặc tạo lại clip thiếu tiếng trước khi ghép.' : 'Hãy kiểm tra các clip hoặc chọn chế độ Không tiếng.'}`);
      setConcatProgress('Ghép thất bại. Vui lòng thử lại.');
    } finally {
      // Dọn dẹp an toàn các tệp tạm trong virtual filesystem
      for (const name of fileNames) {
        try { await ffmpegService.deleteFile(name); } catch {}
      }
      try { await ffmpegService.deleteFile('merged_output.mp4'); } catch {}
      setIsConcatenating(false);
    }
  };

  const currentPreviewClip = clipOrder[activePreviewIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl p-4 md:p-6 shadow-2xl text-zinc-100 max-h-[95vh] flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">movie_edit</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Timeline Biên Tập &amp; Ghép Nối Video</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {clipOrder.length} Clip Sẵn Sàng
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {preserveOrder ? 'Giữ thứ tự kịch bản và nhịp lời review xen kẽ, chuẩn hóa tỷ lệ' : 'Sắp xếp thứ tự phân cảnh, chuẩn hóa tỷ lệ'} và xuất video trọn vẹn ({totalDuration} giây)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setAudioPreserveMode('with_audio')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  audioPreserveMode === 'with_audio'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Giữ âm thanh gốc / hòa trộn AAC"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">volume_up</span>
                  <span>Có âm thanh</span>
                </span>
              </button>
              <button
                type="button"
                hidden={requireAudio}
                onClick={() => setAudioPreserveMode('video_only')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  audioPreserveMode === 'video_only'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Chỉ ghép hình ảnh (bỏ âm thanh)"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">volume_off</span>
                  <span>Không tiếng</span>
                </span>
              </button>
            </div>

            <button
              disabled={isConcatenating}
            onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Khu vực giữa: Màn hình xem trước & Thông tin clip */}
        <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Màn hình xem trước */}
          <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative min-h-[260px]">
            {mergedVideoAsset ? (
              <video
                src={mergedVideoAsset.previewUrl}
                controls
                autoPlay
                className="w-full h-full object-contain max-h-[380px]"
              />
            ) : currentPreviewClip ? (
              <video
                ref={videoPlayerRef}
                src={currentPreviewClip.videoAsset.previewUrl}
                controls
                autoPlay={isPlayingSequence}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain max-h-[380px]"
              />
            ) : (
              <div className="text-center p-6 text-zinc-500">
                <span className="material-symbols-outlined text-4xl">movie</span>
                <p className="text-xs mt-1">Chưa có clip nào để xem trước</p>
              </div>
            )}

            {mergedVideoAsset && (
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-md">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Video Trọn Vẹn Đã Ghép Hoàn Chỉnh</span>
              </div>
            )}
          </div>

          {/* Chi tiết phân cảnh đang chọn */}
          <div className="md:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-amber-400">
                  {currentPreviewClip ? `Cảnh #${currentPreviewClip.sceneNumber}: ${currentPreviewClip.stageName}` : 'Thông Tin Clip'}
                </span>
                <span className="text-xs font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                  {currentPreviewClip?.duration || 0}s
                </span>
              </div>

              {currentPreviewClip && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 block">{requireAudio ? 'Lời review / ASMR:' : 'Lời thoại KOC:'}</label>
                  <p className="text-xs text-zinc-200 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 leading-relaxed italic">
                    {currentPreviewClip.dialogue ? `“${currentPreviewClip.dialogue}”` : requireAudio ? 'ASMR thuần · chỉ tiếng thao tác' : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlaySequence}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    {isPlayingSequence ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlayingSequence ? 'Tạm Dừng Chuỗi' : 'Phát Toàn Bộ Chuỗi'}</span>
                </button>

                {mergedVideoAsset && (
                  <button
                    type="button"
                    onClick={async () => {
                      await Flow.download({
                        base64: mergedVideoAsset.base64,
                        mimeType: 'video/mp4',
                        filename: `Video_Review_Full_${Date.now()}.mp4`
                      });
                    }}
                    className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">download</span>
                    <span>Tải Video Full</span>
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-[11px] text-rose-300 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-sm text-rose-400 shrink-0 mt-0.5">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {concatProgress && (
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    {isConcatenating && <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />}
                    <span>Trạng Thái Ghép Nối:</span>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400">{concatProgress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khu vực Timeline kéo thả / sắp xếp các clip */}
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-sm">view_timeline</span>
              <span>Dải Timeline Phân Cảnh ({clipOrder.length} Clip • {totalDuration} giây)</span>
            </span>
            <span className="text-[11px] text-zinc-400">Bấm &lt; &gt; để đổi thứ tự xuất hiện</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {clipOrder.map((clip, idx) => {
              const isSelected = activePreviewIndex === idx;
              return (
                <div
                  key={`${clip.sceneNumber}_${idx}`}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`p-2 rounded-xl border shrink-0 w-36 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold">#{clip.sceneNumber}</span>
                    <span className="font-mono bg-zinc-900 px-1.5 rounded">{clip.duration}s</span>
                  </div>

                  <p className="text-[10px] font-semibold truncate text-zinc-200">
                    {clip.stageName}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
                    <button
                      type="button"
                      disabled={preserveOrder || isConcatenating || idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveClip(idx, 'left');
                      }}
                      className="p-0.5 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                      title="Chuyển lên trước"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className="text-[9px] text-zinc-500 font-mono">Vị trí {idx + 1}</span>
                    <button
                      type="button"
                      disabled={preserveOrder || isConcatenating || idx === clipOrder.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveClip(idx, 'right');
                      }}
                      className="p-0.5 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                      title="Chuyển ra sau"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút hành động ghép nối */}
        <div className="pt-3 flex gap-2">
          <button
            type="button"
            disabled={isConcatenating}
            onClick={onClose}
            className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleConcatenateVideos}
            disabled={isConcatenating || clipOrder.length < 2}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isConcatenating ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Đang Ghép Nối Video &amp; Chuẩn Hóa...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base font-bold">call_merge</span>
                <span>Ghép Nối {clipOrder.length} Clip ({audioPreserveMode === 'with_audio' ? 'Hòa âm AAC' : 'Không tiếng'} • {totalDuration}s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
