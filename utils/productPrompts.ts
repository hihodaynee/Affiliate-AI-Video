import type { SceneCard } from '../types';
import { estimateSafeDuration } from './durationCalculator';

export function productContext(name: string, description: string, appearance: string): string {
  return `Product name: ${name}. Supplied information: ${description || 'Use only details visible in the reference'}. Product identity: ${appearance || 'Preserve the design, colors, proportions and branding visible in the product reference'}. Demonstrate the actual product category and its intended use. Do not substitute a different product or invent benefits.`;
}

export function buildFallbackScenes(name: string, appearance: string, costume: string): SceneCard[] {
  const stages = ['Mở đầu', 'Nhu cầu', 'Giới thiệu', 'Chi tiết', 'Kêu gọi hành động'];
  const dialogues = [
    `Bạn đang tìm hiểu ${name}? Mình cùng xem những chi tiết đáng chú ý nhé.`,
    'Khi chọn mua, hãy cân nhắc nhu cầu, thiết kế và thông tin từ nhà bán hàng.',
    `Đây là ${name}, mình sẽ giới thiệu sản phẩm dựa trên hình ảnh được cung cấp.`,
    'Bạn hãy kiểm tra thông số và hướng dẫn sử dụng để chọn sản phẩm phù hợp.',
    'Xem thông tin sản phẩm và giá hiện tại trong giỏ hàng trước khi quyết định nhé.',
  ];
  return dialogues.map((dialogue, index) => ({
    id: `draft_${Date.now()}_${index}`, sceneNumber: index + 1, stageName: stages[index],
    title: stages[index], durationSeconds: estimateSafeDuration(dialogue),
    cameraAngle: 'Medium shot showing the product clearly', moodTag: 'Tự nhiên',
    visualKeypoints: `Show ${name} as supplied in the reference`, productVisualDetails: appearance,
    costumeDetails: costume, dialogue, actingGuide: 'Present the actual product with natural gestures',
    imagePrompt: `Commercial photo presenting ${name}. ${appearance}. No text, subtitles or watermarks.`,
    videoPrompt: `Creator presents ${name} with natural gestures and a gentle camera movement. No text, subtitles or watermarks.`,
    voiceGuidance: 'Đọc tự nhiên, rõ ràng', generatedImage: null, generatedVideo: null, status: 'idle',
  }));
}
