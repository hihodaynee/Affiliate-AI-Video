import { Flow } from 'flow-sdk';
import type { MediaAsset } from '../types';
import { requireRemoteMedia } from '../utils/media';
import { withTimeout } from '../utils/async';

export async function generateMotionVideo(options: {
  mode: 'v2v_edit' | 'r2v_motion'; source: MediaAsset; characterId: string;
  prompt: string; model: string; resolution: '720p' | '360p';
}) {
  const common = { prompt: options.prompt, referenceImageMediaIds: [options.characterId], modelDisplayName: options.model };
  // An explicit V2V request must not silently become image-to-video generation.
  if (options.mode === 'v2v_edit') {
    return withTimeout(Flow.generate.video({ ...common,
      sourceVideoMediaId: requireRemoteMedia(options.source, 'Video mẫu'), sourceVideoMode: 'edit',
    }));
  }
  return withTimeout(Flow.generate.video({ ...common, durationSeconds: 8, aspectRatio: '9:16', resolution: options.resolution }));
}
