import { z } from 'zod';
import type { AsmrProject } from '../types/asmr';
import { mediaPreview } from '../utils/media';
import { asmrBeatSchema, asmrCreativeSceneSchema } from './asmrGeneration';

const media = (type: 'image' | 'video') => z.object({
  mediaId: z.string(), base64: z.string().min(1), mimeType: z.string().refine(value => value.startsWith(`${type}/`)),
  name: z.string(), type: z.literal(type),
}).transform(asset => ({ ...asset, previewUrl: mediaPreview(asset) }));
const schema = z.object({
  kind: z.literal('asmr_review'), version: z.literal(1),
  product: media('image').nullable(), extraImage: media('image').nullable(),
  productName: z.string().max(200), productFacts: z.string().max(4000), demonstratedActions: z.string().max(2000),
  setting: z.enum(['warm_desk', 'clean_studio']), aspectRatio: z.enum(['9:16', '16:9']),
  resolution: z.enum(['720p', '360p']), videoModel: z.string().min(1).max(100),
  narrationMode: z.enum(['none', 'alternating']), voiceDirection: z.string().max(1000),
  description: z.string().max(1600), creativeReasoning: z.string().max(1600), uncertainties: z.array(z.string().max(1600)).max(8),
  planInputKey: z.string().max(12000),
  scenes: z.array(asmrCreativeSceneSchema.extend({
    beats: z.array(asmrBeatSchema.extend({ action: z.string().max(1600), camera: z.string().max(1600), sound: z.string().max(1600) })).min(1).max(5),
    id: z.string().min(1), status: z.enum(['idle', 'generating', 'done', 'error']), error: z.string().optional(),
    video: media('video').nullable(), audioReview: z.enum(['pending', 'approved', 'rejected']),
  })).max(8).refine(items => new Set(items.map(item => item.id)).size === items.length, 'Trùng mã cảnh'),
  mergedVideo: media('video').nullable(),
});

export function parseAsmrProject(value: unknown): AsmrProject {
  const project = schema.parse(value);
  // Drafts may contain temporarily incomplete text, or a plan for previous
  // inputs. Semantic validation is performed before rendering the current plan.
  // A user may remove a reference while choosing its replacement. Preserve
  // that draft and any completed clips; rendering still requires an image.
  return { ...project, scenes: project.scenes.map(scene => ({
    ...scene, status: scene.status === 'generating' ? 'idle' : scene.status,
    audioReview: scene.video ? scene.audioReview : 'pending',
  })) };
}

export const serializeAsmrProject = (project: AsmrProject) => JSON.stringify(project, (key, value) => key === 'previewUrl' ? undefined : value);

// Separate database and strict kind discriminator: old review imports/autosaves
// cannot overwrite the ASMR workspace, or the other way around.
async function transact(write?: string): Promise<unknown> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('affiliate-ai-video-asmr', 1);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore('projects');
    request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
    request.onerror = () => reject(request.error);
    request.onblocked = () => { blocked = true; reject(new Error('Kho ASMR đang bị chặn bởi cửa sổ khác.')); };
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('projects', write === undefined ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('projects');
      const request = write === undefined ? store.get('current') : store.put(write, 'current');
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Không lưu được dự án ASMR.'));
    });
  } finally { db.close(); }
}

export async function loadAsmrProject(): Promise<AsmrProject | null> {
  const value = await transact();
  return value === undefined ? null : parseAsmrProject(JSON.parse(String(value)));
}
export async function saveAsmrProject(project: AsmrProject): Promise<void> {
  await transact(serializeAsmrProject(project));
}
