/**
 * Tiện ích tối ưu chất lượng prompt cho AI hình ảnh (Nano Banana Pro)
 * và AI chuyển động video (Omni 1.1 Flash / Veo 3.1)
 *
 * NGUYÊN TẮC QUAN TRỌNG:
 * 1. KHÔNG lặp đi lặp lại các cụm từ "not celebrity", "no public figure" nhiều lần vì sẽ gây ra hiện tượng Streisand Effect
 *    khiến bộ lọc AI nhận diện sai là đang cố tình tạo người nổi tiếng.
 * 2. Thay thế tên thương hiệu thương mại thật (vd: Prettyskin, Loreal, Estee Lauder...) thành mô tả thẩm mỹ bao bì
 *    trung tính để tránh kích hoạt bộ lọc thương hiệu/IP của hệ thống video.
 * 3. Dọn dẹp triệt để các vết rác nối chuỗi "NO , NO , NO".
 * 4. Ngắn gọn, súc tích, chỉ giữ lại mô tả ánh sáng, góc máy, chuyển động và khẩu hình.
 */

// Danh sách các từ khóa dễ kích hoạt nhầm bộ lọc người nổi tiếng hoặc bản quyền thương hiệu
const SENSITIVE_KEYWORDS_PATTERN = /\b(celebrity|famous|idol|actor|actress|singer|hollywood|kpop|star|superstar|hasselblad|leica|sony|nike|adidas|apple|gucci|dior|chanel|rolex)\b/gi;

// Danh sách các thương hiệu mỹ phẩm / hàng hóa phổ biến hay bị kích hoạt lọc bản quyền
const BRAND_TRADEMARKS_PATTERN = /\b(prettyskin|loreal|maybelline|estee\s*lauder|innisfree|laneige|sk-ii|shiseido|cerave|la\s*roche-posay|the\s*ordinary|vichy|neutrogena|vaseline)\b/gi;

// Dọn dẹp các mảnh nối chuỗi bị lỗi lặp chữ "NO , NO"
const REPEATED_NO_PATTERN = /(?:ABSOLUTELY\s+)?(?:NO\s*,\s*)+(?:NO\s*)?/gi;

/**
 * Làm sạch prompt để loại bỏ tên người nổi tiếng, thương hiệu nhạy cảm
 * và định hình nhân vật thương mại tự nhiên, tránh lỗi từ chối sinh video.
 */
export function sanitizePolicySafePrompt(rawPrompt: string): string {
  if (!rawPrompt) return '';

  let cleaned = rawPrompt;

  // 1. Dọn dẹp các chuỗi "NO , NO , NO" rác
  cleaned = cleaned.replace(REPEATED_NO_PATTERN, ' ');

  // 2. Thay thế tên thương hiệu cụ thể bằng mô tả sản phẩm thẩm mỹ chung
  cleaned = cleaned.replace(BRAND_TRADEMARKS_PATTERN, 'premium skincare cosmetic bottle');

  // 3. Thay thế các từ nhạy cảm về người nổi tiếng thành từ chỉ người sáng tạo thông thường
  cleaned = cleaned.replace(SENSITIVE_KEYWORDS_PATTERN, (match) => {
    const lower = match.toLowerCase();
    if (['actor', 'actress', 'singer', 'idol', 'celebrity', 'star', 'superstar'].includes(lower)) {
      return 'content creator';
    }
    if (['hasselblad', 'leica', 'sony'].includes(lower)) {
      return 'professional 35mm lens';
    }
    return 'lifestyle aesthetic';
  });

  // 4. Xóa các đoạn thừa đã bị lặp do nhiều lần bấm tạo
  cleaned = cleaned
    .replace(/A 100% original fictional commercial presenter.*?(?:famous person|brand person)\./gi, '')
    .replace(/ABSOLUTELY NO TEXT.*?video footage only\./gi, '')
    .replace(/Clean pure video footage only\./gi, '')
    .trim();

  // 5. Rút gọn thành cấu trúc chuẩn xác duy nhất một lần:
  // - Mô tả bối cảnh và hành động
  // - Chỉ định nhân vật sáng tạo độc lập tự nhiên
  // - Cấm vẽ chữ
  const normalized = `Authentic commercial creator demonstrating the product. ${cleaned} Soft cinematic lighting, natural human skin texture and fluid realistic expressions. Strictly no on-screen text, subtitles, or watermarks.`;

  // Thu gọn khoảng trắng thừa
  return normalized.replace(/\s{2,}/g, ' ').replace(/\.\s*\./g, '.').trim();
}

export function enhanceImagePrompt(basePrompt: string, styleTitle?: string): string {
  const aesthetic = styleTitle ? `Aesthetic style: ${styleTitle}.` : '';
  const safePrompt = sanitizePolicySafePrompt(basePrompt);
  const boosters = [
    'Natural commercial presenter portrait',
    'Hyper-detailed natural skin texture with visible micro-pores, soft studio lighting',
    '8k commercial master photography, authentic eye catchlights',
    'Anatomically accurate hands and natural grip on the product',
    'Pure visual image, zero text, no typography, no watermark'
  ].join(', ');

  return `${safePrompt}. ${aesthetic} ${boosters}.`;
}

export function enhanceMotionVideoPrompt(baseMotionPrompt: string, cameraDynamics?: string): string {
  const camera = cameraDynamics ? `Camera movement: ${cameraDynamics}.` : 'Smooth steadycam motion with gentle cinematic tracking.';
  const safeMotion = sanitizePolicySafePrompt(baseMotionPrompt);
  const motionBoosters = [
    'Seamless temporal consistency across all frames',
    'Fluid natural organic human biomechanics and body gestures',
    'Stable face geometry without morphing, warping or jitter',
    'Authentic natural hair and fabric physics',
    'Crisp frame rate, cinematic motion blur',
    'Clean raw cinematography, absolutely no text, no subtitles on screen'
  ].join(', ');

  return `${safeMotion}. ${camera} ${motionBoosters}.`;
}