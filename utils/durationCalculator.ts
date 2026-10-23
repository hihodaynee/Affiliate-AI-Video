/**
 * Tính toán số từ và ước tính thời lượng video tối ưu (4s, 6s, 8s, 10s) cho Omni 1.1 Flash.
 *
 * Trong thực tế với tiếng Việt (đặc biệt là câu hỏi, câu cảm thán hoặc từ ghép đa âm):
 * - AI video cần ~0.5s - 0.8s đầu để mở khẩu hình và bắt đầu phát âm.
 * - Cần ~0.5s cuối câu để hạ giọng, khép môi tự nhiên tránh bị cắt phụt.
 * - Tốc độ đọc tự nhiên, rõ ràng, có nhấn nhá cảm xúc: ~2.6 - 2.8 từ/giây.
 * 
 * Bảng ngưỡng an toàn:
 * - 4 giây: Thực tế chỉ đọc an toàn tối đa 10 - 12 từ (Ví dụ: "Mấy bà đừng lướt vội, xem ngay bí kíp này nhé!").
 * - 6 giây: Đọc an toàn từ 13 - 18 từ (Câu 18 từ như "Da sạm xỉn... chuẩn Hàn?" phải cần 6s).
 * - 8 giây: Đọc an toàn từ 19 - 25 từ.
 * - 10 giây: Đọc an toàn từ 26 - 32 từ.
 */

export function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function estimateSafeDuration(text: string): 4 | 6 | 8 | 10 {
  const words = calculateWordCount(text);
  
  // Dưới hoặc bằng 12 từ: 4 giây
  if (words <= 12) {
    return 4;
  }
  // Từ 13 đến 18 từ: BẮT BUỘC 6 giây để không bị ngắt giữa chừng
  if (words <= 18) {
    return 6;
  }
  // Từ 19 đến 25 từ: 8 giây
  if (words <= 25) {
    return 8;
  }
  // Trên 25 từ: 10 giây (thời lượng tối đa của Omni 1.1 Flash)
  return 10;
}

export function getMaxWordsForDuration(durationSeconds: 4 | 6 | 8 | 10): number {
  switch (durationSeconds) {
    case 4:
      return 12; // An toàn tối đa 12 từ cho 4s
    case 6:
      return 18; // An toàn tối đa 18 từ cho 6s
    case 8:
      return 25; // An toàn tối đa 25 từ cho 8s
    case 10:
      return 32; // An toàn tối đa 32 từ cho 10s
    default:
      return 12;
  }
}