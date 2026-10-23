import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Flow } from 'flow-sdk';
import { asmrInputKey, asmrTimelineScenes, planAsmr, renderAsmrScene, validateAsmrScenes } from '../services/asmrGeneration';
import { loadAsmrProject, parseAsmrProject, saveAsmrProject, serializeAsmrProject } from '../services/asmrStorage';
import { loadProject, parseProject, saveProject } from '../services/projectStorage';
import { buildFallbackScenes } from '../utils/productPrompts';
import { asmrImage, asmrProject, asmrScene, asmrVideo } from './asmrFixtures';

beforeEach(() => vi.resetAllMocks());
describe('AI-designed ASMR planning', () => {
  it.each([[4], [4,6,10], [8,6,4,10]])('accepts AI-selected durations %j without forcing total length or shot count', async (...durations) => {
    // it.each spreads each row's scene durations into arguments.
    const project = asmrProject();
    const scenes = durations.map((duration,index) => asmrScene(String(index),duration as 4|6|8|10));
    vi.mocked(Flow.generate.text).mockResolvedValue({text:JSON.stringify({...project,scenes})});
    const plan = await planAsmr(project);
    expect(plan.scenes.map(scene=>scene.durationSeconds)).toEqual(durations);
    const request = vi.mocked(Flow.generate.text).mock.calls[0];
    expect(request[1]?.images).toEqual([{base64:asmrImage.base64,mimeType:asmrImage.mimeType}]);
    expect(request[0]).toContain('There is NO target total duration');
    expect(plan.scenes.every(scene=>scene.audioReview==='pending')).toBe(true);
  });
  it('rejects malformed AI output without replacing it with a canned storyboard', async () => {
    vi.mocked(Flow.generate.text).mockResolvedValue({text:'not JSON'});
    await expect(planAsmr(asmrProject())).rejects.toThrow('không đúng JSON');
    expect(Flow.generate.video).not.toHaveBeenCalled();
  });
  it('checks beat timing, short narration and real alternation', () => {
    const project = asmrProject(true);
    expect(()=>validateAsmrScenes(project,project.scenes)).not.toThrow();
    expect(()=>validateAsmrScenes(project,[{...project.scenes[0],beats:[{...project.scenes[0].beats[0],start:1}]}])).toThrow('chồng, hở');
    expect(()=>validateAsmrScenes(project,[project.scenes[0]])).toThrow('cả cảnh');
    expect(()=>validateAsmrScenes(project,[project.scenes[0],project.scenes[0],project.scenes[1]])).toThrow('khoảng ASMR');
    expect(()=>validateAsmrScenes(project,[{...project.scenes[0],narration:'dài '.repeat(40)},project.scenes[1]])).toThrow('tối đa');
    expect(()=>validateAsmrScenes({...project,narrationMode:'none'},project.scenes)).toThrow('không cho phép');
  });
});

describe('ASMR video requests', () => {
  it('keeps product references and AI duration, without carrying voice from old review', async () => {
    const project=asmrProject();
    project.extraImage={...asmrImage,mediaId:'second-view'}; project.planInputKey=asmrInputKey(project);
    vi.mocked(Flow.generate.video).mockResolvedValue(asmrVideo);
    await renderAsmrScene(project,project.scenes[1]);
    expect(Flow.generate.video).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({referenceImageMediaIds:['product-photo','second-view'],durationSeconds:6,aspectRatio:'9:16'}));
    const request=vi.mocked(Flow.generate.video).mock.calls[0][0];
    expect(request.prompt).toContain('PURE ASMR: no speech');
    expect(request.prompt).toContain('generate synchronized native audio');
    expect(request.audioReferenceMediaIds).toBeUndefined();
    expect(request.sourceVideoMediaId).toBeUndefined();
    expect(asmrTimelineScenes(project)[1].durationSeconds).toBe(6);
  });
  it('adds exact Vietnamese review text only to selected voiceover scenes', async () => {
    const project=asmrProject(true);
    vi.mocked(Flow.generate.video).mockResolvedValue(asmrVideo);
    await renderAsmrScene(project,project.scenes[0]); await renderAsmrScene(project,project.scenes[1]);
    expect(vi.mocked(Flow.generate.video).mock.calls[0][0].prompt).toContain('Speak EXACTLY once: "Bề mặt có màu đen."');
    expect(vi.mocked(Flow.generate.video).mock.calls[1][0].prompt).toContain('PURE ASMR');
    expect(vi.mocked(Flow.generate.video).mock.calls[1][0].prompt).not.toContain('Speak EXACTLY');
  });
  it('blocks stale plans and invalid product references before charging for a render', async () => {
    const project=asmrProject();
    await expect(renderAsmrScene({...project,productFacts:'changed'},project.scenes[0])).rejects.toThrow('Đầu vào đã thay đổi');
    await expect(renderAsmrScene({...project,product:{...asmrImage,mediaId:'upload_123'}},project.scenes[0])).rejects.toThrow('chưa được tải');
    expect(Flow.generate.video).not.toHaveBeenCalled();
  });
  it('surfaces model failure, never retries silently or fabricates a video', async () => {
    const project=asmrProject();
    vi.mocked(Flow.generate.video).mockRejectedValue(new Error('Audio not supported'));
    await expect(renderAsmrScene(project,project.scenes[0])).rejects.toThrow('Audio not supported');
    expect(Flow.generate.video).toHaveBeenCalledTimes(1);
  });
});

describe('ASMR persistence isolation', () => {
  it('round trips the separate project and does not overwrite the old review', async () => {
    await saveProject({productName:'Review cũ',scenes:buildFallbackScenes('Review cũ','','')});
    const project=asmrProject(true);
    project.scenes[0]={...project.scenes[0],video:asmrVideo,status:'done',audioReview:'approved'};
    project.scenes[1].status='generating';
    await saveAsmrProject(project);
    const saved=await loadAsmrProject();
    expect((await loadProject())?.productName).toBe('Review cũ');
    expect(saved?.scenes[1].status).toBe('idle');
    expect(saved?.scenes[0]).toMatchObject({audioReview:'approved',narration:'Bề mặt có màu đen.',video:{previewUrl:'data:video/mp4;base64,YWJj'}});
    expect(serializeAsmrProject(project)).not.toContain('previewUrl');
  });
  it('rejects mixed project formats and duplicate scenes', () => {
    expect(()=>parseAsmrProject({scenes:buildFallbackScenes('old','','')})).toThrow();
    expect(()=>parseProject(asmrProject())).toThrow();
    const project=asmrProject();
    expect(()=>parseAsmrProject({...project,scenes:[project.scenes[0],project.scenes[0]]})).toThrow();
  });
  it('restores unfinished edits while enforcing them before render', async () => {
    const project=asmrProject(); project.scenes[0].beats[0].sound='';
    const saved=parseAsmrProject(JSON.parse(serializeAsmrProject(project)));
    expect(saved.scenes[0].beats[0].sound).toBe('');
    await expect(renderAsmrScene(saved,saved.scenes[0])).rejects.toThrow('Nội dung cảnh');
    expect(Flow.generate.video).not.toHaveBeenCalled();
  });
  it('restores drafts after removing the product image without losing completed clips', async () => {
    const project=asmrProject();
    project.product=null;
    project.scenes[0]={...project.scenes[0],video:asmrVideo,status:'done',audioReview:'approved'};
    await saveAsmrProject(project);
    const restored=(await loadAsmrProject())!;
    expect(restored.product).toBeNull();
    expect(restored.scenes[0].video?.base64).toBe(asmrVideo.base64);
    await expect(renderAsmrScene(restored,restored.scenes[1])).rejects.toThrow('thêm một ảnh');
    expect(Flow.generate.video).not.toHaveBeenCalled();
  });
});
