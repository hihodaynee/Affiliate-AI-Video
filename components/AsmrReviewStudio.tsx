import React, { useEffect, useRef, useState } from 'react';
import { Flow } from 'flow-sdk';
import { AVAILABLE_VIDEO_MODELS } from '../constants';
import type { MediaAsset } from '../types';
import type { AsmrProject, AsmrScene } from '../types/asmr';
import { useAsmrProject } from '../hooks/useAsmrProject';
import { asmrInputKey, asmrTimelineScenes, planAsmr, renderAsmrScene } from '../services/asmrGeneration';
import { parseAsmrProject, serializeAsmrProject } from '../services/asmrStorage';
import { mediaPreview, requireRemoteMedia } from '../utils/media';
import { withTimeout } from '../utils/async';
import { MediaUploader } from './MediaUploader';
import { VideoConcatenatorTimeline } from './VideoConcatenatorTimeline';

const inputClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-teal-400 focus:outline-none';
const buttonClass = 'rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed';
const primaryClass = 'rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed';
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Thao tác thất bại. Hãy thử lại.';

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không đọc được tệp JSON.'));
    reader.readAsText(file);
  });
}

export function AsmrReviewStudio() {
  const { project, setProject, loading, storageMessage } = useAsmrProject();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const lock = useRef(false);
  const active = useRef(true);
  const stop = useRef(false);
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; stop.current = true; }; }, []);

  const planCurrent = project.scenes.length > 0 && project.planInputKey === asmrInputKey(project);
  const totalDuration = project.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  const ready = project.scenes.filter(scene => scene.video && scene.audioReview === 'approved').length;
  const canMerge = planCurrent && ready === project.scenes.length;

  const finishVideo = () => {
    if (lock.current || !canMerge) return;
    if (project.scenes.length === 1) {
      setProject(current => ({ ...current, mergedVideo: current.scenes[0].video }));
      setProgress('Video một cảnh đã hoàn tất. Bạn có thể tải trực tiếp, giữ nguyên hình ảnh và âm thanh.');
    } else setTimelineOpen(true);
  };

  const updateInput = (patch: Partial<AsmrProject>) => {
    if (!lock.current) setProject(current => ({ ...current, ...patch }));
  };
  const patchScene = (id: string, patch: Partial<AsmrScene>) => {
    if (!active.current) return;
    setProject(current => ({ ...current, mergedVideo: null,
      scenes: current.scenes.map(scene => scene.id === id ? { ...scene, ...patch } : scene),
    }));
  };
  const editScene = (id: string, patch: Partial<AsmrScene>) => {
    if (!lock.current) patchScene(id, { ...patch, video: null, status: 'idle', audioReview: 'pending', error: undefined });
  };

  const run = async (message: string, task: () => Promise<void>) => {
    if (lock.current || timelineOpen) return;
    lock.current = true; setBusy(true); setError(''); setProgress(message);
    try { await task(); }
    catch (failure) { if (active.current) { setError(errorText(failure)); setProgress(''); } }
    finally { lock.current = false; if (active.current) setBusy(false); }
  };

  const selectImage = (slot: 'product' | 'extraImage') => run('Đang chọn ảnh...', async () => {
    const asset = await withTimeout(Flow.media.select({ filter: 'image' }), 120_000);
    if (asset && active.current) {
      if (asset.type !== 'image' || !asset.mimeType.startsWith('image/') || !asset.base64) throw new Error('Hãy chọn ảnh sản phẩm hợp lệ.');
      requireRemoteMedia(asset, 'Ảnh sản phẩm');
      setProject(current => ({ ...current, [slot]: { ...asset, name: asset.name || 'Sản phẩm', previewUrl: mediaPreview(asset) } }));
    }
    setProgress('');
  });
  const uploadBusy = (value: boolean) => { lock.current = value; if (active.current) setBusy(value); };
  const uploaded = (slot: 'product' | 'extraImage', asset: MediaAsset) => {
    if (active.current) setProject(current => ({ ...current, [slot]: asset }));
  };

  const makePlan = () => run('AI đang phân tích sản phẩm và xây dựng kịch bản...', async () => {
    const plan = await planAsmr(project);
    if (!active.current) return;
    setProject(current => ({ ...current, ...plan, planInputKey: asmrInputKey(project), mergedVideo: null }));
    setProgress(`AI đề xuất ${plan.scenes.length} cảnh, ${plan.scenes.reduce((total, scene) => total + scene.durationSeconds, 0)} giây. Bạn có thể sửa từng nhịp trước khi tạo video.`);
  });

  const renderScenes = (ids: string[]) => run('Đang chuẩn bị tạo video...', async () => {
    if (!planCurrent) throw new Error('Hãy lập kịch bản cho đầu vào hiện tại trước.');
    stop.current = false; setStopRequested(false); setBatchRunning(true);
    try {
      for (const id of ids) {
        if (!active.current || stop.current) break;
        const scene = project.scenes.find(item => item.id === id)!;
        setProgress(`Đang tạo cảnh ${project.scenes.indexOf(scene) + 1}/${project.scenes.length}: ${scene.title} (${scene.durationSeconds}s)...`);
        patchScene(id, { status: 'generating', error: undefined, video: null, audioReview: 'pending' });
        try { patchScene(id, { video: await renderAsmrScene(project, scene), status: 'done', audioReview: 'pending' }); }
        catch (failure) { patchScene(id, { status: 'error', error: errorText(failure) }); throw failure; }
      }
      if (active.current) setProgress(stop.current ? 'Đã dừng sau cảnh hiện tại; các clip đã tạo được giữ lại.' : 'Đã nhận video. Hãy nghe kiểm tra tiếng thao tác và lời review trước khi ghép.');
    } finally { if (active.current) setBatchRunning(false); }
  });

  const download = (asset: MediaAsset, filename: string) => run('Đang tải xuống...', async () => {
    await withTimeout(Flow.download({ base64: asset.base64, mimeType: asset.mimeType, filename }), 120_000);
    setProgress('Đã gửi yêu cầu tải xuống.');
  });
  const exportProject = () => run('Đang xuất dự án ASMR...', async () => {
    const bytes = new TextEncoder().encode(serializeAsmrProject(project));
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
    await withTimeout(Flow.download({ base64: btoa(binary), mimeType: 'application/json', filename: 'Affiliate_ASMR_Project.json' }), 120_000);
    setProgress('Đã xuất dự án ASMR.');
  });

  if (loading) return <p role="status" className="p-6 text-zinc-400">Đang khôi phục ASMR...</p>;
  return (
    <section aria-label="ASMR Review" className="space-y-6">
      <div className="rounded-3xl border border-teal-400/30 bg-gradient-to-br from-teal-950/60 to-zinc-900 p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-teal-300">Product sound studio</p>
            <h1 className="mt-2 text-2xl font-bold text-white">ASMR Review</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">Bắt đầu từ một ảnh sản phẩm. AI chọn câu chuyện, thao tác, tiếng động và thời lượng phù hợp. Thêm lời review xen kẽ khi bạn muốn.</p>
          </div>
          <div className="flex gap-2">
            <button className={buttonClass} disabled={busy} onClick={() => importRef.current?.click()}>Nhập ASMR JSON</button>
            <button className={buttonClass} disabled={busy} onClick={exportProject}>Xuất ASMR JSON</button>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-400" role="status">{storageMessage}</p>
        <input ref={importRef} type="file" accept=".json,application/json" aria-label="Nhập dự án ASMR" className="hidden" disabled={busy} onChange={event => {
          const file = event.target.files?.[0]; event.target.value = '';
          if (!file) return;
          void run('Đang nhập dự án ASMR...', async () => {
            if (file.size > 300 * 1024 * 1024) throw new Error('Tệp dự án vượt quá 300 MB.');
            const saved = parseAsmrProject(JSON.parse(await readText(file)));
            if (active.current) { setProject(saved); setProgress('Đã khôi phục riêng dự án ASMR.'); }
          });
        }} />
      </div>

      <fieldset disabled={busy || timelineOpen} className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
          <MediaUploader label="Ảnh sản phẩm" sublabel="Bắt buộc · sản phẩm rõ nét, đủ hình dáng" icon="inventory_2" filter="image" asset={project.product}
            onSelect={() => { void selectImage('product'); }} onClear={() => updateInput({product: null})}
            onUploadFile={asset => uploaded('product', asset)} onUploadBusyChange={uploadBusy} />
          <details className="rounded-2xl border border-zinc-800 p-4">
            <summary className="cursor-pointer text-sm text-zinc-300">Ảnh góc khác (không bắt buộc)</summary>
            <div className="mt-3"><MediaUploader label="Góc nhìn bổ sung" sublabel="Cùng sản phẩm · giúp giữ đúng cấu tạo" icon="photo_library" filter="image" asset={project.extraImage}
              onSelect={() => { void selectImage('extraImage'); }} onClear={() => updateInput({extraImage: null})}
              onUploadFile={asset => uploaded('extraImage', asset)} onUploadBusyChange={uploadBusy} /></div>
          </details>
          <p className="text-xs leading-relaxed text-zinc-400">Không cần ảnh người mẫu hoặc bối cảnh. Với sản phẩm có khớp, nút hay nắp, mô tả cách hoạt động sẽ giúp AI chọn thao tác đúng hơn.</p>
        </div>
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="font-semibold">Thông tin bổ sung <span className="text-xs font-normal text-zinc-400">· có thể để trống</span></h2>
          <label className="block space-y-1 text-xs text-zinc-300"><span>Tên sản phẩm</span><input className={inputClass} value={project.productName} maxLength={200} placeholder="AI sẽ nhận diện từ ảnh nếu để trống" onChange={event => updateInput({productName: event.target.value})} /></label>
          <label className="block space-y-1 text-xs text-zinc-300"><span>Chất liệu, cấu tạo và thông tin đúng về sản phẩm</span><textarea className={inputClass} rows={2} maxLength={4000} value={project.productFacts} placeholder="Ví dụ: giá đỡ bằng nhôm, có hai khớp gập..." onChange={event => updateInput({productFacts: event.target.value})} /></label>
          <label className="block space-y-1 text-xs text-zinc-300"><span>Thao tác sản phẩm thực sự làm được</span><textarea className={inputClass} rows={2} maxLength={2000} value={project.demonstratedActions} placeholder="Ví dụ: gập phẳng, chỉnh độ nghiêng, đặt điện thoại. Bỏ trống: AI chỉ trình diễn ngoại hình." onChange={event => updateInput({demonstratedActions: event.target.value})} /></label>
          <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="accent-teal-400" checked={project.narrationMode === 'alternating'} onChange={event => updateInput({narrationMode: event.target.checked ? 'alternating' : 'none'})} />Có giọng review xen kẽ</label>
            <p className="text-xs text-zinc-400">{project.narrationMode === 'none' ? 'Chỉ nghe tiếng thao tác sản phẩm, không lời nói và không nhạc.' : 'AI chọn đoạn cần lời review, xen giữa là những đoạn chỉ nghe tiếng thao tác.'}</p>
            {project.narrationMode === 'alternating' && <label className="block space-y-1 text-xs"><span>Chất giọng mong muốn</span><input className={inputClass} maxLength={1000} value={project.voiceDirection} onChange={event => updateInput({voiceDirection: event.target.value})} /></label>}
          </div>
          <details>
            <summary className="cursor-pointer text-xs text-zinc-400">Bối cảnh, khung hình và model</summary>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1"><span>Bối cảnh</span><select className={inputClass} value={project.setting} onChange={event => updateInput({setting: event.target.value as AsmrProject['setting']})}><option value="warm_desk">Bàn làm việc ấm áp</option><option value="clean_studio">Studio tối giản</option></select></label>
              <label className="space-y-1"><span>Tỷ lệ khung hình</span><select className={inputClass} value={project.aspectRatio} onChange={event => updateInput({aspectRatio: event.target.value as AsmrProject['aspectRatio']})}><option value="9:16">Dọc 9:16</option><option value="16:9">Ngang 16:9</option></select></label>
              <label className="space-y-1 col-span-2"><span>Model video cho ASMR</span><select className={inputClass} value={project.videoModel} onChange={event => updateInput({videoModel: event.target.value, resolution: event.target.value.startsWith('Veo ') ? '720p' : project.resolution})}>{AVAILABLE_VIDEO_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
              <label className="space-y-1"><span>Độ phân giải</span><select className={inputClass} value={project.resolution} onChange={event => updateInput({resolution: event.target.value as AsmrProject['resolution']})}><option value="720p">720p</option><option value="360p" disabled={project.videoModel.startsWith('Veo ')}>360p</option></select></label>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">Chọn model có tạo âm thanh. Khả năng tạo tiếng và thời lượng thực tế tùy model đang có trên Flow; mỗi clip cần được nghe kiểm tra.</p>
          </details>
          <button className={`${primaryClass} w-full`} disabled={!project.product || busy} onClick={makePlan}>{project.scenes.length ? 'AI lập lại kịch bản ASMR' : 'AI phân tích & viết kịch bản'}</button>
        </div>
      </fieldset>

      {progress && <p role="status" className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-3 text-sm text-teal-200">{progress}</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-sm text-rose-300">{error}</p>}
      {batchRunning && <button className={buttonClass} disabled={stopRequested} onClick={() => { stop.current = true; setStopRequested(true); }}>{stopRequested ? 'Sẽ dừng sau cảnh đang tạo' : 'Dừng sau cảnh hiện tại'}</button>}

      {project.scenes.length > 0 && <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Kịch bản AI · {project.scenes.length} cảnh · {totalDuration} giây</h2><span className="text-xs text-teal-300">Thời lượng do AI đề xuất</span></div>
          <p className="text-sm text-zinc-200">{project.creativeReasoning}</p>
          <p className="text-xs text-zinc-400">Nhận diện: {project.description}</p>
          {project.uncertainties.length > 0 && <div className="rounded-xl bg-amber-950/30 p-3 text-xs text-amber-200"><p className="font-semibold">Thông tin ảnh chưa thể xác định</p><ul className="mt-1 list-disc pl-4">{project.uncertainties.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          {!planCurrent && <p role="status" className="text-sm text-amber-300">Đầu vào đã thay đổi. Lập lại kịch bản trước khi tạo hoặc ghép video. Các clip trước vẫn có thể tải xuống.</p>}
          <div className="flex flex-wrap gap-2">
            <button className={primaryClass} disabled={busy || timelineOpen || !planCurrent || project.scenes.every(scene => scene.video && scene.audioReview !== 'rejected')} onClick={() => renderScenes(project.scenes.filter(scene => !scene.video || scene.audioReview === 'rejected').map(scene => scene.id))}>Tạo các cảnh chưa đạt</button>
            <button className={buttonClass} disabled={busy || !canMerge} onClick={finishVideo}>{project.scenes.length === 1 ? 'Hoàn tất' : 'Ghép'} video ASMR ({ready}/{project.scenes.length} đã nghe)</button>
          </div>
          <p className="text-xs text-zinc-400">Mỗi cảnh tạo video là một yêu cầu riêng trên Flow. Lỗi sẽ dừng lượt tạo; những cảnh hoàn tất được giữ lại.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {project.scenes.map((scene, index) => <article key={scene.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <div className="flex justify-between gap-3"><h3 className="font-semibold">{index + 1}. {scene.title}</h3><span className="shrink-0 text-xs text-teal-300">{scene.durationSeconds}s · {scene.audioMode === 'asmr' ? 'ASMR thuần' : 'Có lời review'}</span></div>
            <p className="text-xs text-zinc-400">{scene.purpose}</p>
            {scene.video && <video key={scene.video.previewUrl} src={scene.video.previewUrl} controls playsInline preload="metadata" aria-label={`Video ASMR cảnh ${index + 1}`} className="w-full max-h-80 rounded-xl bg-black object-contain" />}
            <fieldset disabled={busy || timelineOpen || !planCurrent} className="space-y-3">
              {scene.audioMode === 'voiceover' && <label className="block space-y-1 text-xs text-teal-200"><span>Lời review cảnh {index + 1}</span><textarea className={inputClass} rows={2} maxLength={600} value={scene.narration} onChange={event => editScene(scene.id, {narration: event.target.value})} /></label>}
              <details>
                <summary className="cursor-pointer text-xs text-zinc-300">Xem / sửa nhịp thao tác và âm thanh</summary>
                <p className="mt-2 text-xs text-zinc-500">Sửa nội dung cảnh sẽ cần tạo lại clip đó.</p>
                {scene.beats.map((beat, beatIndex) => <div key={beatIndex} className="mt-3 space-y-2 rounded-xl border border-zinc-800 p-3">
                  <p className="text-xs font-semibold text-teal-300">{beat.start}–{beat.end}s</p>
                  {(['action', 'camera', 'sound'] as const).map(field => <label key={field} className="block space-y-1 text-xs text-zinc-400"><span>{field === 'action' ? 'Thao tác' : field === 'camera' ? 'Góc máy' : 'Âm thanh'} · cảnh {index + 1}, nhịp {beatIndex + 1}</span><textarea className={inputClass} rows={2} maxLength={1600} value={beat[field]} onChange={event => editScene(scene.id, {beats: scene.beats.map((item, j) => j === beatIndex ? {...item, [field]: event.target.value} : item)})} /></label>)}
                </div>)}
              </details>
            </fieldset>
            {scene.error && <p role="alert" className="text-xs text-rose-300">{scene.error}</p>}
            <div className="flex flex-wrap gap-2">
              <button className={buttonClass} disabled={busy || timelineOpen || !planCurrent} onClick={() => renderScenes([scene.id])}>{scene.status === 'generating' ? `Đang tạo cảnh ${index + 1}...` : `${scene.video ? 'Tạo lại' : 'Tạo'} clip ${index + 1}`}</button>
              {scene.video && <button className={buttonClass} disabled={busy} onClick={() => download(scene.video!, `ASMR_${index + 1}.mp4`)}>Tải clip {index + 1}</button>}
            </div>
            {scene.video && <fieldset disabled={busy || timelineOpen} className="rounded-xl bg-zinc-950/60 p-3 space-y-2">
              <p className="text-xs text-zinc-400">Nghe tiếng tiếp xúc có khớp thao tác; cảnh có lời cần rõ tiếng, đúng câu. Kết quả AI chưa được tự xác minh âm thanh.</p>
              <label className="flex gap-2 items-center text-xs"><input type="checkbox" className="accent-teal-400" checked={scene.audioReview === 'approved'} onChange={event => patchScene(scene.id, {audioReview: event.target.checked ? 'approved' : 'pending'})} />Đã nghe: âm thanh cảnh {index + 1} phù hợp</label>
              <button className="text-xs text-rose-300 underline" onClick={() => patchScene(scene.id, {audioReview: 'rejected'})}>Đánh dấu cảnh {index + 1} thiếu / sai tiếng</button>
              {scene.audioReview === 'rejected' && <p className="text-xs text-amber-300">Cảnh cần tạo lại âm thanh trước khi ghép.</p>}
            </fieldset>}
          </article>)}
        </div>
      </div>}

      {project.mergedVideo && <div className="space-y-3 rounded-2xl border border-teal-500/30 p-5"><h2 className="font-bold">Video ASMR hoàn chỉnh{!planCurrent && ' · đầu vào trước'}</h2><video src={project.mergedVideo.previewUrl} controls playsInline className="w-full max-h-96 bg-black rounded-xl" /><button className={primaryClass} disabled={busy} onClick={() => download(project.mergedVideo!, 'ASMR_Review.mp4')}>Tải video ASMR</button></div>}
      {timelineOpen && <VideoConcatenatorTimeline scenes={asmrTimelineScenes(project)} aspectRatio={project.aspectRatio} isOpen requireAudio preserveOrder onClose={() => setTimelineOpen(false)} onSaveMergedVideo={asset => setProject(current => ({...current, mergedVideo: asset}))} />}
    </section>
  );
}
