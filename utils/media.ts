import type { MediaAsset } from '../types';

export function isRemoteMediaId(id?: string): boolean {
  return Boolean(id?.trim() && !/^(upload_|merged_)/.test(id));
}

export function requireRemoteMedia(asset: Pick<MediaAsset, 'mediaId'>, label: string): string {
  if (!isRemoteMediaId(asset.mediaId)) {
    throw new Error(`${label} chưa được tải lên Flow thành công. Hãy chọn lại tài nguyên từ thư viện hoặc tải lại tệp.`);
  }
  return asset.mediaId;
}

// Data URLs remain valid after JSON/IndexedDB restore and are garbage collected
// with their owning asset. They do not leave an unrevoked Blob URL registry entry.
export function mediaPreview(asset: Pick<MediaAsset, 'mimeType' | 'base64'>): string {
  return `data:${asset.mimeType};base64,${asset.base64}`;
}

export function getVoiceReference(asset: MediaAsset | null): string | undefined {
  if (!asset) return undefined;
  if (asset.type !== 'audio' && asset.type !== 'video') {
    throw new Error('Giọng tham chiếu phải là tệp âm thanh hoặc video có tiếng.');
  }
  return requireRemoteMedia(asset, 'Giọng tham chiếu');
}
