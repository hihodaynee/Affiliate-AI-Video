import { afterEach, describe, expect, it, vi } from 'vitest';
import { Flow } from 'flow-sdk';
import { uploadDeviceFile } from '../services/mediaUpload';
import { getVoiceReference } from '../utils/media';
import { buildFallbackScenes, productContext } from '../utils/productPrompts';
import { generateMotionVideo } from '../services/motionGeneration';
import { withTimeout } from '../utils/async';
import { sanitizePolicySafePrompt } from '../utils/promptEnhancer';
import type { MediaAsset } from '../types';

const media: MediaAsset = { mediaId: 'flow-reference', base64: 'YWJj', mimeType: 'audio/mpeg', type: 'audio', name: 'voice.mp3', previewUrl: '' };
afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });

describe('media references', () => {
  it('uploads audio to Flow and uses the actual returned ID', async () => {
    vi.mocked(Flow.upload).mockResolvedValue({ ...media, mediaId: 'audio-registered' });
    const asset = await uploadDeviceFile(new File(['abc'], 'voice.mp3', {type:'audio/mpeg'}), 'all');
    expect(Flow.upload).toHaveBeenCalledWith({base64:'YWJj', mimeType:'audio/mpeg', name:'voice.mp3'});
    expect(getVoiceReference(asset)).toBe('audio-registered');
  });
  it('reports unsupported audio instead of returning a fabricated media ID', async () => {
    vi.mocked(Flow.upload).mockRejectedValue(new Error('unsupported MIME'));
    await expect(uploadDeviceFile(new File(['abc'], 'voice.wav', {type:'audio/wav'}), 'all')).rejects.toThrow('Không thể tải');
  });
  it('rejects legacy local references and images in a voice slot', async () => {
    expect(() => getVoiceReference({...media, mediaId:'upload_123'})).toThrow('chưa được tải');
    expect(() => getVoiceReference({...media, type:'image'})).toThrow('âm thanh hoặc video');
    await expect(uploadDeviceFile(new File(['abc'], 'image.png', {type:'image/png'}), 'all')).rejects.toThrow('không phù hợp');
    expect(Flow.upload).not.toHaveBeenCalled();
  });
});

describe('generation behavior', () => {
  it('keeps V2V failure visible and never silently generates from an image', async () => {
    vi.mocked(Flow.generate.video).mockRejectedValue(new Error('V2V unavailable'));
    await expect(generateMotionVideo({mode:'v2v_edit', source:{...media,type:'video',mimeType:'video/mp4'}, characterId:'person', prompt:'motion', model:'model',resolution:'720p'})).rejects.toThrow('V2V unavailable');
    expect(Flow.generate.video).toHaveBeenCalledTimes(1);
    expect(Flow.generate.video).toHaveBeenCalledWith(expect.objectContaining({sourceVideoMediaId:'flow-reference',sourceVideoMode:'edit'}));
  });
  it('uses image simulation only when explicitly selected', async () => {
    vi.mocked(Flow.generate.video).mockResolvedValue({...media,type:'video'});
    await generateMotionVideo({mode:'r2v_motion', source:media,characterId:'person',prompt:'walk',model:'model',resolution:'360p'});
    const options = vi.mocked(Flow.generate.video).mock.calls[0][0];
    expect(options).not.toHaveProperty('sourceVideoMode');
    expect(options.resolution).toBe('360p');
  });
  it('builds neutral drafts for products outside cosmetics', () => {
    for (const name of ['Nồi cơm điện', 'Áo khoác', 'Bàn phím']) {
      const draft = buildFallbackScenes(name, 'màu đen', 'áo trắng');
      expect(draft).toHaveLength(5);
      expect(JSON.stringify(draft)).not.toMatch(/serum|skincare|dưỡng ẩm|cosmetic/i);
      expect(productContext(name,'','')).toContain(name);
    }
  });
  it('preserves product brands and exact dialogue in the generation prompt', () => {
    const prompt = 'Product: Apple keyboard. Speak exactly: "Mình đang dùng bàn phím Apple."';
    expect(sanitizePolicySafePrompt(prompt)).toBe(prompt);
  });
  it('releases a waiting operation at the deadline and clears its timer', async () => {
    vi.useFakeTimers();
    const result = withTimeout(new Promise(() => {}), 100);
    const assertion = expect(result).rejects.toThrow('Hết thời gian chờ');
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
