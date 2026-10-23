import { Flow } from 'flow-sdk';
import type { MediaAsset } from '../types';
import { isRemoteMediaId, mediaPreview } from '../utils/media';
import { withTimeout } from '../utils/async';

export async function uploadDeviceFile(file: File, filter: 'image' | 'video' | 'audio' | 'all'): Promise<MediaAsset> {
  const type = file.type.split('/')[0];
  if (!['image', 'video', 'audio'].includes(type) || (filter !== 'all' && type !== filter) || (filter === 'all' && type === 'image')) {
    throw new Error('Định dạng tệp không phù hợp với ô tư liệu này.');
  }
  if (file.size > 100 * 1024 * 1024) throw new Error('Tệp vượt quá 100 MB. Hãy giảm dung lượng trước khi tải.');
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Không thể đọc tệp đã chọn.'));
    reader.readAsDataURL(file);
  });
  let uploaded: Awaited<ReturnType<typeof Flow.upload>>;
  try {
    uploaded = await withTimeout(Flow.upload({ base64, mimeType: file.type, name: file.name }), 120_000);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Dịch vụ tải lên không khả dụng.';
    throw new Error(`Không thể tải ${file.name} lên Flow: ${message}${type === 'audio' ? ' Nếu Flow không hỗ trợ định dạng âm thanh này, hãy chọn video có tiếng từ thư viện.' : ''}`);
  }
  if (!isRemoteMediaId(uploaded?.mediaId)) throw new Error('Flow chưa trả về mã tư liệu hợp lệ. Vui lòng thử tải lại.');
  const asset: MediaAsset = { mediaId: uploaded.mediaId, base64, mimeType: file.type, name: file.name, type: type as MediaAsset['type'], previewUrl: '' };
  return { ...asset, previewUrl: mediaPreview(asset) };
}
