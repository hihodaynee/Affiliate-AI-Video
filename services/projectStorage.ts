import { z } from 'zod';
import { mediaPreview } from '../utils/media';

const asset = z.object({
  mediaId: z.string(), base64: z.string(), mimeType: z.string().regex(/^(image|video|audio)\//),
  name: z.string(), type: z.enum(['image', 'video', 'audio']),
}).transform(value => ({ ...value, previewUrl: mediaPreview(value) }));

const scene = z.object({
  id: z.string(), sceneNumber: z.number().int().positive(), stageName: z.string(), title: z.string(),
  durationSeconds: z.union([z.literal(4), z.literal(6), z.literal(8), z.literal(10)]),
  cameraAngle: z.string(), moodTag: z.string(), visualKeypoints: z.string(),
  productVisualDetails: z.string().optional(), costumeDetails: z.string().optional(),
  dialogue: z.string(), actingGuide: z.string(), imagePrompt: z.string(), videoPrompt: z.string(), voiceGuidance: z.string(),
  generatedImage: asset.nullable(), generatedVideo: asset.nullable(),
  status: z.enum(['idle', 'generating_image', 'generating_video', 'done', 'error']), errorMessage: z.string().optional(),
}).transform(value => ({...value, status: value.status.startsWith('generating_') ? 'idle' as const : value.status}));

export const projectSchema = z.object({
  version: z.literal(1).default(1),
  productName: z.string().default(''), productDescription: z.string().default(''), targetAudience: z.string().default(''),
  selectedStyle: z.enum(['tiktok_ugc', 'luxury_commercial', 'problem_solution', 'unboxing_asmr', 'expert_medical']).default('tiktok_ugc'),
  selectedVoiceTone: z.enum(['warm_natural', 'tiktok_energetic', 'luxury_calm', 'urgent_sale', 'expert_trusted']).default('tiktok_energetic'),
  voiceRegion: z.enum(['north_hanoi', 'south_hcm', 'central_hue_danang']).default('south_hcm'),
  voiceGender: z.enum(['female', 'male']).default('female'), customVoiceNotes: z.string().default(''),
  productAppearance: z.string().default(''), costumeAppearance: z.string().default(''),
  imageModel: z.string().default('🍌 Nano Banana Pro'), videoModel: z.string().default('Omni 1.1 Flash'),
  aspectRatio: z.enum(['9:16', '16:9']).default('9:16'), resolution: z.enum(['720p', '360p']).default('720p'),
  productAsset: asset.nullable().default(null), modelPersonAsset: asset.nullable().default(null),
  backgroundAsset: asset.nullable().default(null), costumeAsset: asset.nullable().default(null), audioVoiceAsset: asset.nullable().default(null),
  scenes: z.array(scene).min(1).max(50).refine(items => new Set(items.map(s => s.sceneNumber)).size === items.length, 'Trùng số phân cảnh'),
});
export type Project = z.output<typeof projectSchema>;

export function parseProject(value: unknown): Project { return projectSchema.parse(value); }

// Avoid saving a second full copy of every base64 payload in previewUrl.
export function serializeProject(value: unknown): string {
  return JSON.stringify(value, (key, item) => key === 'previewUrl' ? undefined : item);
}

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('affiliate-ai-video', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('projects');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Kho dự án đang bị chặn bởi một cửa sổ khác.'));
  });
}

async function transact(write?: string): Promise<unknown> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('projects', write === undefined ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('projects');
      const request = write === undefined ? store.get('current') : store.put(write, 'current');
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Không thể lưu dự án.'));
    });
  } finally { db.close(); }
}
export async function loadProject(): Promise<Project | null> {
  const value = await transact();
  return value === undefined ? null : parseProject(JSON.parse(String(value)));
}
export async function saveProject(value: unknown): Promise<void> {
  await transact(serializeProject(value));
}
