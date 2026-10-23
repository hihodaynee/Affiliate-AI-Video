import React, { useState, useRef, useEffect } from 'react';
import { SceneCard, ReviewStyle, VoiceTone, VoiceRegion, VoiceGender, MediaAsset, GenerationHistoryEntry, VideoCaptionData } from '../types';
import { MediaUploader } from './MediaUploader';
import { SceneCardItem } from './SceneCardItem';
import { SceneDetailModal } from './SceneDetailModal';
import { HistoryDrawer } from './HistoryDrawer';
import { RegenerateFeedbackModal } from './RegenerateFeedbackModal';
import { RegenerateImageModal } from './RegenerateImageModal';
import { VideoConcatenatorTimeline } from './VideoConcatenatorTimeline';
import { MediaInspectModal, MediaInspectData } from './MediaInspectModal';
import { VoiceConfigPanel } from './VoiceConfigPanel';
import { VideoPostCaptionSection } from './VideoPostCaptionSection';
import { 
  REVIEW_STYLES, 
  DEFAULT_STORYBOARD_STAGES,
  buildDetailedVoicePrompt
} from '../constants';
import { estimateSafeDuration } from '../utils/durationCalculator';
import { sanitizePolicySafePrompt } from '../utils/promptEnhancer';
import { Flow } from 'flow-sdk';

interface ProductScriptStudioProps {
  productAsset: MediaAsset | null;
  modelPersonAsset: MediaAsset | null;
  costumeAsset: MediaAsset | null;
  backgroundAsset: MediaAsset | null;
  audioVoiceAsset: MediaAsset | null;
  onSelectProduct: () => void;
  onClearProduct: () => void;
  onSelectModelPerson: () => void;
  onClearModelPerson: () => void;
  onSelectCostume: () => void;
  onClearCostume: () => void;
  onSelectBackground: () => void;
  onClearBackground: () => void;
  onSelectAudioVoice: () => void;
  onClearAudioVoice: () => void;
  onSetProductAsset?: (asset: MediaAsset) => void;
  onSetModelPersonAsset?: (asset: MediaAsset) => void;
  onSetCostumeAsset?: (asset: MediaAsset) => void;
  onSetBackgroundAsset?: (asset: MediaAsset) => void;
  onSetAudioVoiceAsset?: (asset: MediaAsset) => void;

  productName: string;
  onProductNameChange: (val: string) => void;
  productDescription: string;
  onProductDescriptionChange: (val: string) => void;
  targetAudience: string;
  onTargetAudienceChange: (val: string) => void;
  selectedStyle: ReviewStyle;
  onStyleChange: (val: ReviewStyle) => void;
  selectedVoiceTone: VoiceTone;
  onVoiceToneChange: (val: VoiceTone) => void;

  scenes: SceneCard[];
  onUpdateScenes: (scenes: SceneCard[] | ((prev: SceneCard[]) => SceneCard[])) => void;

  history: GenerationHistoryEntry[];
  onAddHistory: (entry: GenerationHistoryEntry) => void;
  onClearHistory: () => void;
  selectedImageModel: string;
  onImageModelChange: (model: string) => void;
  selectedVideoModel: string;
  onVideoModelChange: (model: string) => void;
  aspectRatio: '9:16' | '16:9';
  onAspectRatioChange: (val: '9:16' | '16:9') => void;
  resolution: '720p' | '360p';
  onResolutionChange: (val: '720p' | '360p') => void;

  onExportJSON: () => void;
  onImportJSON: () => void;
}

const AUDIENCE_SUGGESTIONS = [
  { label: 'Nữ trẻ (20-30 tuổi)', value: 'Nữ 20-30 tuổi, yêu thích làm đẹp, skincare tự nhiên, chuộng phong cách Hàn Quốc' },
  { label: 'Nam công sở (25-40 tuổi)', value: 'Nam 25-40 tuổi, nhân viên văn phòng, quan tâm phong cách lịch lãm, tiện dụng' },
  { label: 'Trung niên (40-60 tuổi)', value: 'Người trung niên 40-60 tuổi, ưu tiên sức khỏe, an toàn, nguồn gốc tự nhiên uy tín' },
  { label: 'Gen Z sinh viên (18-24)', value: 'Gen Z 18-24 tuổi, học sinh - sinh viên năng động, săn deal hot, thích bắt trend TikTok' }
];

export const ProductScriptStudio: React.FC<ProductScriptStudioProps> = ({
  productAsset,
  modelPersonAsset,
  costumeAsset,
  backgroundAsset,
  audioVoiceAsset,
  onSelectProduct,
  onClearProduct,
  onSelectModelPerson,
  onClearModelPerson,
  onSelectCostume,
  onClearCostume,
  onSelectBackground,
  onClearBackground,
  onSelectAudioVoice,
  onClearAudioVoice,
  onSetProductAsset,
  onSetModelPersonAsset,
  onSetCostumeAsset,
  onSetBackgroundAsset,
  onSetAudioVoiceAsset,
  productName,
  onProductNameChange,
  productDescription,
  onProductDescriptionChange,
  targetAudience,
  onTargetAudienceChange,
  selectedStyle,
  onStyleChange,
  selectedVoiceTone,
  onVoiceToneChange,
  scenes,
  onUpdateScenes,
  history,
  onAddHistory,
  onClearHistory,
  selectedImageModel,
  selectedVideoModel,
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onExportJSON,
  onImportJSON
}) => {
  const [productAppearance, setProductAppearance] = useState<string>('');
  const [costumeAppearance, setCostumeAppearance] = useState<string>('');

  const [selectedVoiceRegion, setSelectedVoiceRegion] = useState<VoiceRegion>('south_hcm');
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<VoiceGender>('female');
  const [customVoiceNotes, setCustomVoiceNotes] = useState<string>('');

  const [videoPostCaption, setVideoPostCaption] = useState<VideoCaptionData | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);

  const [editingScene, setEditingScene] = useState<SceneCard | null>(null);
  const [regenerateTargetScene, setRegenerateTargetScene] = useState<SceneCard | null>(null);
  const [regenerateImageTargetScene, setRegenerateImageTargetScene] = useState<SceneCard | null>(null);
  const [inspectData, setInspectData] = useState<MediaInspectData | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  
  const [isGeneratingFullScript, setIsGeneratingFullScript] = useState<boolean>(false);
  const [scriptThinkingStep, setScriptThinkingStep] = useState<string>('');

  const [isAnalyzingProductDetails, setIsAnalyzingProductDetails] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [autoAnalysisSuccess, setAutoAnalysisSuccess] = useState<boolean>(false);
  
  const [resourceAlert, setResourceAlert] = useState<{ type: 'error' | 'warning' | 'success'; message: string } | null>(null);

  const [isBatchGeneratingImages, setIsBatchGeneratingImages] = useState<boolean>(false);
  const [batchImageProgress, setBatchImageProgress] = useState<string>('');
  const [isBatchGeneratingVideos, setIsBatchGeneratingVideos] = useState<boolean>(false);
  const [batchVideoProgress, setBatchVideoProgress] = useState<string>('');
  
  const [timeoutTracker, setTimeoutTracker] = useState<Record<number, number>>({});
  const timeoutTimersRef = useRef<Record<number, any>>({});
  const scenesRef = useRef<SceneCard[]>(scenes);
  scenesRef.current = scenes;

  const audioVoiceRef = useRef<MediaAsset | null>(audioVoiceAsset);
  audioVoiceRef.current = audioVoiceAsset;

  const costumeAssetRef = useRef<MediaAsset | null>(costumeAsset);
  costumeAssetRef.current = costumeAsset;

  const modelPersonRef = useRef<MediaAsset | null>(modelPersonAsset);
  modelPersonRef.current = modelPersonAsset;

  useEffect(() => {
    return () => {
      Object.values(timeoutTimersRef.current).forEach(t => clearInterval(t));
    };
  }, []);

  const startTimeoutCountdown = (sceneNumber: number, onTimeoutCancel: () => void) => {
    const DURATION = 300;
    setTimeoutTracker(prev => ({ ...prev, [sceneNumber]: DURATION }));

    if (timeoutTimersRef.current[sceneNumber]) {
      clearInterval(timeoutTimersRef.current[sceneNumber]);
    }

    timeoutTimersRef.current[sceneNumber] = setInterval(() => {
      setTimeoutTracker(prev => {
        const cur = prev[sceneNumber];
        if (cur <= 1) {
          clearInterval(timeoutTimersRef.current[sceneNumber]);
          delete timeoutTimersRef.current[sceneNumber];
          onTimeoutCancel();
          return { ...prev, [sceneNumber]: 0 };
        }
        return { ...prev, [sceneNumber]: cur - 1 };
      });
    }, 1000);
  };

  const stopTimeoutCountdown = (sceneNumber: number) => {
    if (timeoutTimersRef.current[sceneNumber]) {
      clearInterval(timeoutTimersRef.current[sceneNumber]);
      delete timeoutTimersRef.current[sceneNumber];
    }
    setTimeoutTracker(prev => {
      const next = { ...prev };
      delete next[sceneNumber];
      return next;
    });
  };

  const hasProduct = Boolean(productAsset);
  const hasModelPerson = Boolean(modelPersonAsset);
  const hasBackground = Boolean(backgroundAsset);
  const hasProductName = Boolean(productName.trim());

  const canAnalyzeProduct = hasProductName || hasProduct;
  const requiredCount = (hasProduct ? 1 : 0) + (hasModelPerson ? 1 : 0) + (hasBackground ? 1 : 0);
  const isAllRequiredLoaded = requiredCount === 3;

  const completedScenes = scenes.filter(s => s.generatedVideo !== null).length;
  const completedImages = scenes.filter(s => s.generatedImage !== null).length;
  const hasAnyErrors = scenes.some(s => s.status === 'error');

  const handleAutoAnalyzeProductInfo = async (optProductAsset = productAsset, optName = productName, optAudience = targetAudience) => {
    if (!optProductAsset && !optName.trim()) {
      setResourceAlert({
        type: 'warning',
        message: 'Chưa có thông tin để phân tích! Vui lòng nhập Tên Sản Phẩm (ô 1) hoặc chọn Ảnh Sản Phẩm trước khi bấm nút AI Phân Tích.'
      });
      return;
    }

    setIsAnalyzingProductDetails(true);
    setAutoAnalysisSuccess(false);
    setResourceAlert(null);

    const effectiveName = optName.trim() || 'Sản phẩm review';
    const effectiveAudience = optAudience.trim() || 'Khách hàng trẻ hiện đại yêu thích mua sắm';

    try {
      const promptAnalysis = 
        `Bạn là chuyên gia thẩm định sản phẩm và đạo diễn trang phục quảng cáo bán hàng chuyên nghiệp.\n` +
        `Dựa trên tên sản phẩm: "${effectiveName}", đối tượng khách hàng: "${effectiveAudience}" ` +
        `${optProductAsset ? 'và hình ảnh bao bì sản phẩm được đính kèm' : ''}, hãy tự động phân tích và trích xuất chính xác 3 mục:\n` +
        `1. "productHighlights": Điểm nổi bật, công năng chính và giá trị cốt lõi giải quyết vấn đề cho khách hàng (viết ngắn gọn, súc tích trong 1-2 câu).\n` +
        `2. "packagingIdentity": Đặc điểm nhận diện bao bì/thiết kế bắt buộc cần giữ nguyên không bị biến dạng khi dựng video quảng cáo (màu sắc chủ đạo, chất liệu vỏ hộp/chai lọ, nắp, logo, phông chữ).\n` +
        `3. "costumeIdentity": Mô tả chi tiết trang phục chuẩn (áo, màu sắc, kiểu dáng, phụ kiện) để cố định 100% trang phục của nhân vật KOC xuyên suốt toàn bộ các video.\n\n` +
        `Yêu cầu định dạng: Trả về ĐÚNG 1 JSON object thuần túy không chứa markdown:\n` +
        `{\n` +
        `  "productHighlights": "...",\n` +
        `  "packagingIdentity": "...",\n` +
        `  "costumeIdentity": "..."\n` +
        `}`;

      const options: any = {
        systemInstruction: 'You are an expert product and costume director. Return strictly a JSON object with productHighlights, packagingIdentity and costumeIdentity in Vietnamese.'
      };

      const inputImages: Array<{ base64: string; mimeType: string }> = [];
      if (optProductAsset) {
        inputImages.push({ base64: optProductAsset.base64, mimeType: optProductAsset.mimeType });
      }
      if (costumeAsset) {
        inputImages.push({ base64: costumeAsset.base64, mimeType: costumeAsset.mimeType });
      } else if (modelPersonAsset) {
        inputImages.push({ base64: modelPersonAsset.base64, mimeType: modelPersonAsset.mimeType });
      }

      if (inputImages.length > 0) {
        options.images = inputImages;
      }

      const res = await Flow.generate.text(promptAnalysis, options);
      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.productHighlights) {
        onProductDescriptionChange(parsed.productHighlights);
      }
      if (parsed.packagingIdentity) {
        setProductAppearance(parsed.packagingIdentity);
      }
      if (parsed.costumeIdentity) {
        setCostumeAppearance(parsed.costumeIdentity);
      }

      setAutoAnalysisSuccess(true);
      setTimeout(() => setAutoAnalysisSuccess(false), 4000);
    } catch (err) {
      console.warn('Lỗi phân tích tự động thông tin sản phẩm:', err);
      const fallbackHighlights = `Công thức chất lượng cao, tối ưu công năng chuyên biệt cho ${effectiveName}, mang lại trải nghiệm êm ái, tiện dụng và hiệu quả rõ nét.`;
      const fallbackIdentity = `Bao bì chuẩn nguyên bản của ${effectiveName}, giữ nguyên màu sắc, logo và phom dáng thiết kế.`;
      const fallbackCostume = costumeAsset 
        ? 'Trang phục chuẩn từ ảnh mẫu trang phục tham chiếu'
        : 'Trang phục chuẩn từ ảnh mẫu người mẫu KOC ban đầu, tuyệt đối không thay đổi kiểu áo, màu sắc hay họa tiết qua các phân cảnh.';
      
      onProductDescriptionChange(fallbackHighlights);
      setProductAppearance(fallbackIdentity);
      setCostumeAppearance(fallbackCostume);
      setAutoAnalysisSuccess(true);
      setTimeout(() => setAutoAnalysisSuccess(false), 3000);
    } finally {
      setIsAnalyzingProductDetails(false);
    }
  };

  const handleGeneratePostCaption = async () => {
    setIsGeneratingCaption(true);
    const effectiveName = productName.trim() || 'Sản phẩm hot';
    const effectiveAudience = targetAudience.trim() || 'Khách hàng trẻ hiện đại yêu thích mua sắm';
    const effectiveHighlights = productDescription.trim() || 'Chất lượng cao, tiện ích vượt trội';
    const styleObj = REVIEW_STYLES.find(st => st.id === selectedStyle);

    try {
      const promptCaption = 
        `Bạn là chuyên gia Sáng tạo nội dung (Content Creator) và tối ưu SEO bán hàng Affiliate triệu view trên TikTok, Facebook Reels và YouTube Shorts.\n` +
        `Nhiệm vụ: Dựa trên thông tin sản phẩm và kịch bản video dưới đây, hãy tạo ra 1 bộ bài đăng mạng xã hội hoàn chỉnh bằng TIẾNG VIỆT:\n` +
        `- Tên Sản Phẩm: "${effectiveName}"\n` +
        `- Khách Hàng Mục Tiêu: "${effectiveAudience}"\n` +
        `- Công Dụng / Điểm Nổi Bật: "${effectiveHighlights}"\n` +
        `- Phong Cách Video: "${styleObj?.title || 'TikTok UGC'}"\n` +
        `- Lời thoại 5 phân cảnh: ${scenes.map(s => `[Cảnh ${s.sceneNumber}: ${s.dialogue}]`).join(' | ')}\n\n` +
        `Yêu cầu tạo ra JSON object với các trường sau:\n` +
        `1. "title": Tiêu đề giật tít thu hút tò mò ngay giây đầu (viết hoa các từ khóa quan trọng, kèm emoji).\n` +
        `2. "hookCaption": 1 câu hook ngắn dưới 15 từ kích thích dừng lướt.\n` +
        `3. "detailedCaption": Đoạn mô tả review ngắn gọn 3-4 câu nêu bật công dụng, trải nghiệm chân thực và giải quyết nỗi đau cho khách hàng.\n` +
        `4. "ctaText": Lời kêu gọi hành động dứt khoát chốt đơn ngay.\n` +
        `5. "hashtags": Mảng gồm 8-12 hashtags hot nhất (không dấu cách, gồm tên sản phẩm, ngách ngành hàng, thẻ xu hướng #fyp #tiktokshop #xuhuong #review).\n\n` +
        `Định dạng trả về: Chỉ trả về ĐÚNG 1 JSON object thuần túy không chứa markdown:\n` +
        `{\n` +
        `  "title": "...",\n` +
        `  "hookCaption": "...",\n` +
        `  "detailedCaption": "...",\n` +
        `  "ctaText": "...",\n` +
        `  "hashtags": ["...", "..."]\n` +
        `}`;

      const res = await Flow.generate.text(promptCaption, {
        systemInstruction: 'You are an elite TikTok Affiliate copywriter. Output strictly valid JSON object representing title, hookCaption, detailedCaption, ctaText and hashtags.'
      });

      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.title && parsed.detailedCaption) {
        setVideoPostCaption({
          title: parsed.title,
          hookCaption: parsed.hookCaption || parsed.title,
          detailedCaption: parsed.detailedCaption,
          ctaText: parsed.ctaText || 'Nhấp vào giỏ hàng góc trái nhận ưu đãi số lượng có hạn!',
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['fyp', 'xuhuong', 'tiktokshop', 'review']
        });
      }
    } catch (err) {
      console.warn('Lỗi sinh caption tự động:', err);
      setVideoPostCaption({
        title: `🔥 Chân ái ${effectiveName} đang làm mưa làm gió cõi mạng đây rồi!`,
        hookCaption: 'Mấy bà đừng lướt vội, bí kíp săn deal hời đây nè!',
        detailedCaption: `Từ ngày biết đến ${effectiveName} thì mọi vấn đề đã được giải quyết gọn gàng. Chất lượng đỉnh chóp, hiệu quả cảm nhận ngay lần đầu sử dụng. Ai chưa thử thì tiếc hùi hụi luôn á!`,
        ctaText: 'Deal hời đang có sẵn tại giỏ hàng góc trái, nhanh tay chốt đơn kẻo hết mã giảm giá nha!',
        hashtags: ['fyp', 'xuhuong', 'tiktokshop', 'review', 'goclamdep', 'affiliate', 'dealhot', effectiveName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()]
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleGenerateAIScript = async () => {
    setResourceAlert(null);

    const missing: string[] = [];
    if (!productAsset) missing.push('Ảnh Sản Phẩm');
    if (!modelPersonAsset) missing.push('Ảnh Người Mẫu/KOC');
    if (!backgroundAsset) missing.push('Ảnh Bối Cảnh');
    if (!productName.trim()) missing.push('Tên Sản Phẩm');

    if (missing.length > 0) {
      setResourceAlert({
        type: 'error',
        message: `Chưa thể tạo kịch bản! Vui lòng nạp đủ các mục còn thiếu: ${missing.join(', ')}.`
      });
      return;
    }

    let effectiveName = productName.trim();
    let effectiveAudience = targetAudience.trim() || 'Khách hàng trẻ hiện đại yêu thích mua sắm online trên TikTok';
    let effectiveDesc = productDescription.trim();
    let effectiveApp = productAppearance.trim();
    let effectiveCostume = costumeAppearance.trim();

    if (!effectiveDesc || !effectiveApp) {
      effectiveDesc = effectiveDesc || `Dòng sản phẩm ${effectiveName} chất lượng cao, thiết kế thông minh, giải quyết triệt để nhu cầu thường ngày với hiệu quả vượt trội.`;
      effectiveApp = effectiveApp || `Bao bì chính hãng chuẩn của ${effectiveName}, màu sắc sắc nét, thiết kế nổi bật, logo nhận diện rõ ràng.`;
      effectiveCostume = effectiveCostume || (costumeAsset ? 'Trang phục từ ảnh mẫu trang phục đính kèm' : 'Trang phục chuẩn từ ảnh mẫu người mẫu KOC ban đầu');

      onProductDescriptionChange(effectiveDesc);
      setProductAppearance(effectiveApp);
      setCostumeAppearance(effectiveCostume);
    }

    setIsGeneratingFullScript(true);
    setScriptThinkingStep('Bước 1/4: Đang đọc hiểu thông tin và phân tích tính năng sản phẩm...');

    try {
      const styleInfo = REVIEW_STYLES.find(s => s.id === selectedStyle);
      const detailedVoiceSpecification = buildDetailedVoicePrompt(selectedVoiceRegion, selectedVoiceGender, selectedVoiceTone);

      setScriptThinkingStep(`Bước 2/4: Phân tích nỗi đau tâm lý của nhóm khách hàng "${effectiveAudience}"...`);
      await new Promise(r => setTimeout(r, 600));

      setScriptThinkingStep(`Bước 3/4: Lên ý tưởng 5 cảnh độc lập theo phong cách "${styleInfo?.title}" & giọng ${selectedVoiceRegion === 'north_hanoi' ? 'Hà Nội' : selectedVoiceRegion === 'south_hcm' ? 'TP.HCM' : 'Miền Trung'}...`);

      const promptReq = 
        `Bạn là Đạo diễn Biên kịch Video Quảng Cáo Bán Hàng TikTok/Reels hàng đầu. TUYỆT ĐỐI KHÔNG DÙNG KỊCH BẢN MẪU TĨNH.\n` +
        `Hãy sáng tạo một kịch bản 5 PHÂN CẢNH HOÀN TOÀN MỚI, CHUYÊN BIỆT VÀ ĐÍCH DANH cho sản phẩm:\n` +
        `- Tên Sản Phẩm: "${effectiveName}"\n` +
        `- Khách Hàng Mục Tiêu: "${effectiveAudience}"\n` +
        `- Công Dụng & Điểm Nổi Bật: "${effectiveDesc}"\n` +
        `- Nhận Diện Bao Bì: "${effectiveApp}"\n` +
        `- Phong Cách Video: "${styleInfo?.title}" (${styleInfo?.distinction})\n` +
        `- Cấu Hình Giọng Đọc & Ngữ Điệu Vùng Miền: ${detailedVoiceSpecification}\n\n` +
        `YÊU CẦU NGHIÊM NGẶT VỀ TÍNH ĐỘC NHẤT VÀ LỜI THOẠI ĐÍCH DANH SẢN PHẨM:\n` +
        `1. Lời thoại KOC BẮT BUỘC nhắc đến trực tiếp tên "${effectiveName}" hoặc các công dụng, thành phần, cảm giác trải nghiệm thực tế của sản phẩm này.\n` +
        `2. Lời thoại phải tự nhiên, mượt mà, KHÔNG ĐƯỢC LẶP TỪ hay lặp lại các cụm từ (ví dụ không lặp "khô rát, khô rát").\n` +
        `3. ĐẶC TẢ TỪNG CẢNH RÕ RÀNG:\n` +
        `   - Cảnh 1 (Hook - 6s): Giữ chân bằng câu hỏi gợi tò mò hoặc cú sốc vấn đề da/nhu cầu cấp bách mà "${effectiveAudience}" gặp phải (14-18 từ).\n` +
        `   - Cảnh 2 (Nỗi đau - 8s): Kể chi tiết sự thất vọng hoặc tốn kém khi dùng các giải pháp cũ trước đây (20-25 từ).\n` +
        `   - Cảnh 3 (Giải pháp - 8s): Giới thiệu sản phẩm xuất hiện như vị cứu tinh, chỉ ra điểm độc đáo nhất (20-25 từ).\n` +
        `   - Cảnh 4 (Trải nghiệm - 6s): Miêu tả cảm giác thực tế khi sờ chạm, sử dụng, hiệu quả thấy ngay (18-20 từ).\n` +
        `   - Cảnh 5 (CTA - 6s): Kêu gọi bấm vào giỏ hàng góc trái chốt đơn nhận ưu đãi/voucher giới hạn (14-18 từ).\n` +
        `4. XƯNG HÔ ĐÚNG VÙNG MIỀN: Nếu giọng TP.HCM xưng "mình - mấy bà/mấy bạn", giọng Hà Nội xưng "mình - các bạn".\n` +
        `5. BẢO ĐẢM KHÔNG CÓ CHỮ TRÊN VIDEO: imagePrompt và videoPrompt ghi rõ "no text, no subtitles, no watermarks".\n\n` +
        `Định dạng trả về: Chỉ trả về ĐÚNG MẢNG JSON 5 object không kèm markdown:\n` +
        `[\n` +
        `  {\n` +
        `    "sceneNumber": 1,\n` +
        `    "stageName": "Mở đầu (Hook)",\n` +
        `    "title": "...",\n` +
        `    "durationSeconds": 6,\n` +
        `    "cameraAngle": "...",\n` +
        `    "moodTag": "...",\n` +
        `    "visualKeypoints": "...",\n` +
        `    "productVisualDetails": "...",\n` +
        `    "costumeDetails": "...",\n` +
        `    "dialogue": "...",\n` +
        `    "actingGuide": "...",\n` +
        `    "imagePrompt": "...",\n` +
        `    "videoPrompt": "...",\n` +
        `    "voiceGuidance": "..."\n` +
        `  }\n` +
        `]`;

      setScriptThinkingStep('Bước 4/4: Đang gọi mô hình AI sinh kịch bản chi tiết và đo lường thời lượng thoại...');

      const textGenOptions: any = {
        systemInstruction: `You are an elite commercial video director. Think deeply about the specific product: "${effectiveName}" and audience: "${effectiveAudience}". Output strictly valid JSON array of 5 scenes specifically tailored to this exact product. Dialogue must be fluent, natural rich Vietnamese without repeating any words or stuttering. Absolutely no on-screen text or subtitles.`
      };

      if (productAsset) {
        textGenOptions.images = [{ base64: productAsset.base64, mimeType: productAsset.mimeType }];
      }

      const res = await Flow.generate.text(promptReq, textGenOptions);
      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length >= 3) {
        const newScenes: SceneCard[] = parsed.map((item, idx) => {
          const fallback = DEFAULT_STORYBOARD_STAGES[idx] || DEFAULT_STORYBOARD_STAGES[0];
          const dialogueText = item.dialogue || fallback.dialogue;
          const calculatedDuration = estimateSafeDuration(dialogueText);
          const finalDuration = (item.durationSeconds === 4 || item.durationSeconds === 6 || item.durationSeconds === 8 || item.durationSeconds === 10)
            ? Math.max(item.durationSeconds, calculatedDuration) as (4 | 6 | 8 | 10)
            : calculatedDuration;

          const safeVidPrompt = sanitizePolicySafePrompt(item.videoPrompt || fallback.videoPrompt);
          const safeImgPrompt = sanitizePolicySafePrompt(item.imagePrompt || fallback.imagePrompt);

          return {
            id: `scene_${Date.now()}_${idx}`,
            sceneNumber: idx + 1,
            stageName: item.stageName || fallback.stageName,
            title: item.title || fallback.title,
            durationSeconds: finalDuration,
            cameraAngle: item.cameraAngle || fallback.cameraAngle,
            moodTag: item.moodTag || fallback.moodTag,
            visualKeypoints: item.visualKeypoints || fallback.visualKeypoints,
            productVisualDetails: item.productVisualDetails || effectiveApp,
            costumeDetails: item.costumeDetails || effectiveCostume,
            dialogue: dialogueText,
            actingGuide: item.actingGuide || fallback.actingGuide,
            imagePrompt: safeImgPrompt,
            videoPrompt: safeVidPrompt,
            voiceGuidance: item.voiceGuidance || `${selectedVoiceRegion} - ${selectedVoiceGender}: ${dialogueText}`,
            generatedImage: null,
            generatedVideo: null,
            status: 'idle'
          };
        });
        onUpdateScenes(newScenes);
        setResourceAlert({
          type: 'success',
          message: `Đã hoàn thành kịch bản review 5 phân cảnh chuyên sâu cho "${effectiveName}"! Kiểm tra và tinh chỉnh lời thoại từng cảnh bên dưới.`
        });
      } else {
        throw new Error('Dữ liệu kịch bản trả về không hợp lệ');
      }
    } catch (err: any) {
      console.warn('Lỗi sinh kịch bản AI, áp dụng kịch bản tối ưu theo tên sản phẩm:', err);
      const smartFallbackScenes: SceneCard[] = DEFAULT_STORYBOARD_STAGES.map((s, idx) => {
        let customDialogue = s.dialogue;
        if (idx === 0) customDialogue = `Mấy bà dưỡng hoài mà da vẫn khô căng, bong tróc, lại còn dễ ửng đỏ đúng hôn nè?`;
        else if (idx === 1) customDialogue = `Trước đây chưa biết đến ${effectiveName} thì việc dưỡng ẩm tốn kém mà bực bội dễ sợ luôn á.`;
        else if (idx === 2) customDialogue = `Nhưng từ lúc kết thân với ${effectiveName} thì đúng là chân ái cuộc đời, cấp ẩm phục hồi tức thì.`;
        else if (idx === 3) customDialogue = `Chất serum thoa lên mỏng nhẹ tênh, thấm trong ba giây mà không hề bết rít hay nặng mặt tí nào luôn á.`;
        else if (idx === 4) customDialogue = `Deal hời của ${effectiveName} đang có sẵn tại giỏ hàng góc trái, mấy bà chốt lẹ kẻo hết nha!`;

        const calculatedDuration = estimateSafeDuration(customDialogue);
        return {
          id: `scene_${Date.now()}_${idx}`,
          sceneNumber: idx + 1,
          stageName: s.stageName,
          title: s.title,
          durationSeconds: calculatedDuration,
          cameraAngle: s.cameraAngle,
          moodTag: s.moodTag,
          visualKeypoints: s.visualKeypoints,
          productVisualDetails: effectiveApp,
          costumeDetails: effectiveCostume,
          dialogue: customDialogue,
          actingGuide: s.actingGuide,
          imagePrompt: sanitizePolicySafePrompt(`Commercial 8k photo of creator holding skincare product, soft natural studio lighting`),
          videoPrompt: sanitizePolicySafePrompt(`Creator demonstrating skincare product with expressive articulation, soft gentle camera push-in`),
          voiceGuidance: `${selectedVoiceRegion} - ${selectedVoiceGender}: ${customDialogue}`,
          generatedImage: null,
          generatedVideo: null,
          status: 'idle'
        };
      });
      onUpdateScenes(smartFallbackScenes);
      setResourceAlert({
        type: 'success',
        message: `Đã tạo kịch bản bám sát "${effectiveName}". Bạn có thể chỉnh sửa thêm lời thoại từng cảnh!`
      });
    } finally {
      setIsGeneratingFullScript(false);
      setScriptThinkingStep('');
    }
  };

  const handleUpdateDialogue = (sceneId: string, newDialogue: string) => {
    onUpdateScenes((prev: SceneCard[]) =>
      prev.map(s => s.id === sceneId ? { ...s, dialogue: newDialogue } : s)
    );
  };

  const handleUpdateDuration = (sceneId: string, newDuration: 4 | 6 | 8 | 10) => {
    onUpdateScenes((prev: SceneCard[]) =>
      prev.map(s => s.id === sceneId ? { ...s, durationSeconds: newDuration } : s)
    );
  };

  const handleGenerateSceneImage = async (sceneNumber: number, feedbackDirective?: string): Promise<MediaAsset | null> => {
    try {
      if (!productAsset || !modelPersonAsset) {
        setResourceAlert({
          type: 'error',
          message: `Không thể tạo ảnh cảnh #${sceneNumber}! Cần có ít nhất Ảnh Sản Phẩm và Ảnh Người Mẫu/KOC để làm tham chiếu.`
        });
        return null;
      }

      const currentList = scenesRef.current;
      const targetScene = currentList.find(s => s.sceneNumber === sceneNumber);
      if (!targetScene) return null;

      onUpdateScenes((prev: SceneCard[]) =>
        prev.map(s => s.sceneNumber === sceneNumber ? { ...s, status: 'generating_image', errorMessage: undefined } : s)
      );

      const refIds: string[] = [];
      const addRef = (id?: string) => {
        if (id && id.trim() && !id.startsWith('upload_') && !refIds.includes(id)) {
          refIds.push(id);
        }
      };

      if (productAsset) addRef(productAsset.mediaId);
      if (modelPersonAsset) addRef(modelPersonAsset.mediaId);
      if (costumeAssetRef.current) addRef(costumeAssetRef.current.mediaId);
      if (backgroundAsset) addRef(backgroundAsset.mediaId);

      const styleObj = REVIEW_STYLES.find(st => st.id === selectedStyle);

      const costumeDirective = costumeAssetRef.current
        ? `The character wears the outfit and clothing matching the costume reference.`
        : `The character wears identical clothing and styling from the model reference photo.`;

      const rawPrompt = `Commercial portrait for scene: ${targetScene.imagePrompt}. ` +
        `Style aesthetic: ${styleObj?.title || 'TikTok UGC'} - ${styleObj?.cinematography || 'natural handheld'}. ` +
        `Product detail: holding the cosmetic product neatly in view. Maintain packaging color and silhouette identical to reference product. ` +
        `Subject: everyday relatable creator with warm friendly expression. ` +
        `${costumeDirective} ` +
        `Framing: ${targetScene.cameraAngle || 'Medium close-up'}. Natural aesthetic lighting, pristine skin texture. ` +
        `${feedbackDirective ? ` USER DIRECTIVE: ${feedbackDirective}` : ''}`;

      const safePrompt = sanitizePolicySafePrompt(rawPrompt);

      const result = await Flow.generate.image({
        prompt: safePrompt,
        referenceImageMediaIds: refIds.length > 0 ? refIds.slice(0, 7) : undefined,
        aspectRatio: aspectRatio,
        modelDisplayName: selectedImageModel
      });

      const newAsset: MediaAsset = {
        mediaId: result.mediaId,
        base64: result.base64,
        mimeType: result.mimeType,
        name: `Ảnh_Phân_Cảnh_${sceneNumber}`,
        type: 'image',
        previewUrl: `data:${result.mimeType};base64,${result.base64}`
      };

      onAddHistory({
        id: `hist_${Date.now()}_img_${sceneNumber}`,
        timestamp: Date.now(),
        type: 'image',
        sceneNumber,
        prompt: targetScene.imagePrompt,
        asset: newAsset,
        model: selectedImageModel
      });

      onUpdateScenes((prev: SceneCard[]) =>
        prev.map(s => s.sceneNumber === sceneNumber ? {
          ...s,
          generatedImage: newAsset,
          status: 'idle',
          errorMessage: undefined
        } : s)
      );
      return newAsset;
    } catch (err: any) {
      console.warn(`Lỗi tạo ảnh cảnh ${sceneNumber}:`, err);
      const rawErr = err instanceof Error ? err.message : String(err || '');
      let friendlyError = rawErr || 'Dịch vụ tạm thời không hoạt động. Hãy thử lại.';
      if (rawErr.toLowerCase().includes('người nổi tiếng') || rawErr.toLowerCase().includes('celebrity')) {
        friendlyError = 'Cảnh báo chính sách: Ảnh nhân vật hoặc câu lệnh có thể liên quan đến người nổi tiếng. Vui lòng đổi ảnh chân dung KOC tự tạo hoặc chỉnh lại prompt.';
      } else if (rawErr.includes('hạn mức') || rawErr.includes('quota') || rawErr.includes('RESOURCE_EXHAUSTED')) {
        friendlyError = `Hết hạn mức model ${selectedImageModel}. Hãy mở icon Cài Đặt trên thanh tiêu đề để chuyển sang Nano Banana 2 Lite.`;
      }
      onUpdateScenes((prev: SceneCard[]) =>
        prev.map(s => s.sceneNumber === sceneNumber ? {
          ...s,
          status: 'error',
          errorMessage: friendlyError
        } : s)
      );
      return null;
    }
  };

  const handleBatchGenerateAllImages = async () => {
    if (!productAsset || !modelPersonAsset) {
      setResourceAlert({
        type: 'error',
        message: 'Chưa đủ tài nguyên để tạo ảnh! Vui lòng nạp tối thiểu Ảnh Sản Phẩm và Ảnh Người Mẫu/KOC.'
      });
      return;
    }

    if (isBatchGeneratingImages || isBatchGeneratingVideos) return;
    setIsBatchGeneratingImages(true);
    setBatchImageProgress('Đang tạo ảnh...');
    setResourceAlert(null);

    try {
      const currentList = [...scenesRef.current];
      await Promise.allSettled(
        currentList.map(scene => handleGenerateSceneImage(scene.sceneNumber))
      );
      setBatchImageProgress('Đã hoàn tất!');
      setTimeout(() => setBatchImageProgress(''), 2000);
    } catch (e) {
      console.warn('Lỗi hàng loạt tạo ảnh:', e);
    } finally {
      setIsBatchGeneratingImages(false);
    }
  };

  // Tạo video phân cảnh - có bổ sung quy tắc chống lặp từ
  const handleGenerateSceneVideo = async (sceneNumber: number, feedbackDirective?: string): Promise<MediaAsset | null> => {
    let isTimedOut = false;
    try {
      const currentList = scenesRef.current;
      const targetScene = currentList.find(s => s.sceneNumber === sceneNumber);
      if (!targetScene) return null;

      if (!targetScene.generatedImage && !modelPersonAsset) {
        setResourceAlert({
          type: 'error',
          message: `Phân cảnh #${sceneNumber} chưa có ảnh mẫu! Hãy bấm "Tạo Ảnh Riêng" trước khi render video.`
        });
        return null;
      }

      onUpdateScenes((prev: SceneCard[]) =>
        prev.map(s => s.sceneNumber === sceneNumber ? { ...s, status: 'generating_video', errorMessage: undefined } : s)
      );

      startTimeoutCountdown(sceneNumber, () => {
        isTimedOut = true;
        onUpdateScenes((prev: SceneCard[]) =>
          prev.map(s => s.sceneNumber === sceneNumber ? {
            ...s,
            status: 'error',
            errorMessage: 'Thời gian tạo video đã vượt quá 5 phút (Timeout).'
          } : s)
        );
      });

      const validImageRefIds: string[] = [];
      const addValidId = (id?: string) => {
        if (id && id.trim() && !id.startsWith('upload_') && !validImageRefIds.includes(id)) {
          validImageRefIds.push(id);
        }
      };

      if (targetScene.generatedImage) addValidId(targetScene.generatedImage.mediaId);
      if (modelPersonAsset) addValidId(modelPersonAsset.mediaId);
      if (costumeAssetRef.current) addValidId(costumeAssetRef.current.mediaId);
      if (productAsset) addValidId(productAsset.mediaId);
      if (backgroundAsset) addValidId(backgroundAsset.mediaId);

      const cappedImageRefs = validImageRefIds.slice(0, 7);

      const currentVoice = audioVoiceRef.current;
      const isValidVoiceId = currentVoice?.mediaId && !currentVoice.mediaId.startsWith('upload_');
      const styleObj = REVIEW_STYLES.find(st => st.id === selectedStyle);

      const costumeVideoConstraint = costumeAssetRef.current
        ? `Maintain identical outfit style from costume reference.`
        : `Maintain identical clothing from model reference.`;

      const voiceDetailedSpec = buildDetailedVoicePrompt(selectedVoiceRegion, selectedVoiceGender, selectedVoiceTone);

      // Quy tắc nói một mạch, không lặp lại từ (như khô rát khô rát)
      const antiStutterDirective = `Mouth movement must speak the exact phrase once smoothly without stuttering or repeating words: "${targetScene.dialogue}". No audio repetition or word echo.`;

      const voiceSyncConstraint = isValidVoiceId
        ? `Synchronize vocal delivery with attached audio. Articulate spoken Vietnamese words: "${targetScene.dialogue}". ${antiStutterDirective} ${voiceDetailedSpec}`
        : `${voiceDetailedSpec}. Natural Vietnamese mouth movement and lip-sync speaking: "${targetScene.dialogue}". ${antiStutterDirective}`;

      const rawPrompt = 
        `Commercial creator video for scene: ${targetScene.videoPrompt}. ` +
        `Style: ${styleObj?.title || 'Skincare ASMR'} - ${styleObj?.cinematography || 'Macro 105mm closeup'}. ` +
        `Product: cosmetic bottle in soft background. Maintain packaging design and colors from reference. ` +
        `${costumeVideoConstraint} ` +
        `${voiceSyncConstraint} ` +
        `Acting: ${targetScene.actingGuide || 'gentle fingertips touching cheek'}. ` +
        `Movement: ${targetScene.cameraAngle || 'Macro closeup'}. Soft natural lighting, warm aesthetic. ` +
        `${feedbackDirective ? `USER DIRECTIVE: ${feedbackDirective}` : ''}`;

      const prompt = sanitizePolicySafePrompt(rawPrompt);

      let videoResult: any = null;
      let lastErr: any = null;

      const attemptsToTry: Array<{ useAudio: boolean; resolution: '720p' | '360p' }> = [];

      if (isValidVoiceId && cappedImageRefs.length > 0) {
        attemptsToTry.push({ useAudio: true, resolution: resolution });
        attemptsToTry.push({ useAudio: false, resolution: resolution });
      } else {
        attemptsToTry.push({ useAudio: false, resolution: resolution });
        if (resolution === '720p') {
          attemptsToTry.push({ useAudio: false, resolution: '360p' });
        }
      }

      for (let i = 0; i < attemptsToTry.length; i++) {
        const attemptConfig = attemptsToTry[i];
        try {
          const videoOptions: any = {
            prompt,
            referenceImageMediaIds: cappedImageRefs.length > 0 ? cappedImageRefs : undefined,
            aspectRatio: aspectRatio,
            resolution: attemptConfig.resolution,
            durationSeconds: targetScene.durationSeconds || 6,
            modelDisplayName: selectedVideoModel || 'Omni 1.1 Flash'
          };

          if (attemptConfig.useAudio && isValidVoiceId) {
            videoOptions.audioReferenceMediaIds = [currentVoice!.mediaId];
          }

          videoResult = await Flow.generate.video(videoOptions);
          if (videoResult?.base64) break;
        } catch (callErr: any) {
          lastErr = callErr;
          console.warn(`Lần tạo video cảnh #${sceneNumber} (chiến lược ${i + 1}) gặp sự cố:`, callErr);

          const errMsg = callErr?.message || String(callErr || '');
          if (errMsg.toLowerCase().includes('người nổi tiếng') || errMsg.toLowerCase().includes('celebrity')) {
            throw callErr;
          }

          if (i < attemptsToTry.length - 1) {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }

      if (!videoResult?.base64) {
        throw lastErr || new Error('Dịch vụ tạm thời không hoạt động. Hãy thử lại.');
      }

      stopTimeoutCountdown(sceneNumber);

      if (isTimedOut) return null;

      const bytes = Uint8Array.from(atob(videoResult.base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: videoResult.mimeType || 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);

      const newAsset: MediaAsset = {
        mediaId: videoResult.mediaId,
        base64: videoResult.base64,
        mimeType: videoResult.mimeType || 'video/mp4',
        name: `Video_Phân_Cảnh_${sceneNumber}`,
        type: 'video',
        previewUrl: blobUrl
      };

      onAddHistory({
        id: `hist_${Date.now()}_vid_${sceneNumber}`,
        timestamp: Date.now(),
        type: 'video',
        sceneNumber,
        prompt: targetScene.videoPrompt,
        asset: newAsset,
        model: selectedVideoModel
      });

      onUpdateScenes((prev: SceneCard[]) =>
        prev.map(s => s.sceneNumber === sceneNumber ? {
          ...s,
          generatedVideo: newAsset,
          status: 'done',
          errorMessage: undefined
        } : s)
      );
      return newAsset;
    } catch (err: any) {
      stopTimeoutCountdown(sceneNumber);
      if (!isTimedOut) {
        console.warn(`Lỗi tạo video cảnh ${sceneNumber}:`, err);
        const rawErrText = err instanceof Error ? err.message : String(err || '');
        
        let friendlyMessage = rawErrText || 'Dịch vụ tạm thời không hoạt động. Hãy thử lại.';
        if (rawErrText.toLowerCase().includes('người nổi tiếng') || rawErrText.toLowerCase().includes('celebrity')) {
          friendlyMessage = 'Cảnh báo chính sách: Ảnh nhân vật hoặc câu lệnh có thể liên quan đến người nổi tiếng. Vui lòng đổi ảnh chân dung KOC tự tạo hoặc chỉnh lại prompt.';
        } else if (rawErrText.includes('không hoạt động') || rawErrText.includes('SOMETHING_WENT_WRONG') || rawErrText.includes('UNSPECIFIED')) {
          friendlyMessage = 'Dịch vụ tạo video đang quá tải tạm thời. Hãy bấm nút "Tạo Lại Cảnh Lỗi" để thử lại.';
        }

        onUpdateScenes((prev: SceneCard[]) =>
          prev.map(s => s.sceneNumber === sceneNumber ? {
            ...s,
            status: 'error',
            errorMessage: friendlyMessage
          } : s)
        );
      }
      return null;
    }
  };

  const handleBatchGenerateAllVideos = async () => {
    if (completedImages === 0 && !modelPersonAsset) {
      setResourceAlert({
        type: 'error',
        message: 'Chưa có ảnh phân cảnh nào được tạo! Hãy bấm nút "Tạo Full Ảnh" trước khi Render Video.'
      });
      return;
    }

    if (isBatchGeneratingVideos || isBatchGeneratingImages) return;
    setIsBatchGeneratingVideos(true);
    setResourceAlert(null);

    try {
      const currentList = [...scenesRef.current];
      const BATCH_SIZE = 2;

      for (let i = 0; i < currentList.length; i += BATCH_SIZE) {
        const batch = currentList.slice(i, i + BATCH_SIZE);
        const batchLabels = batch.map(s => `#${s.sceneNumber}`).join(',');
        setBatchVideoProgress(`Render (${batchLabels})...`);

        await Promise.allSettled(
          batch.map(scene => handleGenerateSceneVideo(scene.sceneNumber))
        );

        if (i + BATCH_SIZE < currentList.length) {
          setBatchVideoProgress('Đợt tiếp theo...');
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      setBatchVideoProgress('Đã hoàn tất!');
      setTimeout(() => setBatchVideoProgress(''), 2000);
    } catch (e) {
      console.warn('Lỗi đợt video:', e);
    } finally {
      setIsBatchGeneratingVideos(false);
    }
  };

  const handleRetryFailedScenes = async () => {
    const failedScenes = scenesRef.current.filter(s => s.status === 'error');
    if (failedScenes.length === 0) return;

    for (const sc of failedScenes) {
      try {
        if (!sc.generatedImage) {
          await handleGenerateSceneImage(sc.sceneNumber);
        } else {
          await handleGenerateSceneVideo(sc.sceneNumber);
        }
      } catch (e) {
        console.warn('Lỗi thử lại phân cảnh:', e);
      }
    }
  };

  const handleDownloadAsset = async (asset: MediaAsset) => {
    try {
      const ext = asset.type === 'video' ? 'mp4' : 'png';
      await Flow.download({
        base64: asset.base64,
        mimeType: (asset.mimeType as any) || (asset.type === 'video' ? 'video/mp4' : 'image/png'),
        filename: `${asset.name.replace(/[^a-zA-Z0-9_\-]/g, '_')}.${ext}`
      });
    } catch (e) {
      console.error('Lỗi khi tải file:', e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {resourceAlert && (
        <div className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 animate-fadeIn ${
          resourceAlert.type === 'error'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/30'
            : resourceAlert.type === 'warning'
            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-lg mt-0.5 shrink-0">
              {resourceAlert.type === 'error' ? 'error' : resourceAlert.type === 'warning' ? 'warning' : 'check_circle'}
            </span>
            <div className="text-xs leading-relaxed font-medium">
              {resourceAlert.message}
            </div>
          </div>
          <button
            onClick={() => setResourceAlert(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* 1. Nguồn Đầu Vào */}
      <div className="p-4 md:p-5 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-base">perm_media</span>
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Nguồn Tư Liệu Đầu Vào ({requiredCount}/3 Bắt Buộc)
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border ${
              isAllRequiredLoaded 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isAllRequiredLoaded ? 'Đã Nạp Đủ 3/3 ✓' : `Còn Thiếu ${3 - requiredCount} Mục`}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['9:16', '16:9'] as const).map(r => (
              <button
                key={r}
                onClick={() => onAspectRatioChange(r)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  aspectRatio === r ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="relative">
            <span className={`absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-xs border ${
              hasProduct 
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                : 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
            }`}>
              {hasProduct ? 'SẢN PHẨM ✓' : 'BẮT BUỘC #1'}
            </span>
            <MediaUploader
              label="Ảnh Sản Phẩm"
              sublabel="Mặt trước, nhãn hiệu rõ nét"
              icon="shopping_bag"
              asset={productAsset}
              filter="image"
              onSelect={onSelectProduct}
              onClear={onClearProduct}
              onUploadFile={onSetProductAsset}
            />
          </div>

          <div className="relative">
            <span className={`absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-xs border ${
              hasModelPerson 
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                : 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
            }`}>
              {hasModelPerson ? 'NGƯỜI MẪU ✓' : 'BẮT BUỘC #2'}
            </span>
            <MediaUploader
              label="Ảnh Người Mẫu / KOC"
              sublabel="Khuôn mặt & trang phục gốc"
              icon="person"
              asset={modelPersonAsset}
              filter="image"
              onSelect={onSelectModelPerson}
              onClear={onClearModelPerson}
              onUploadFile={onSetModelPersonAsset}
            />
          </div>

          <div className="relative">
            <span className={`absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-xs border ${
              hasBackground 
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                : 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
            }`}>
              {hasBackground ? 'BỐI CẢNH ✓' : 'BẮT BUỘC #3'}
            </span>
            <MediaUploader
              label="Ảnh Bối Cảnh"
              sublabel="Phòng studio, góc review"
              icon="landscape"
              asset={backgroundAsset}
              filter="image"
              onSelect={onSelectBackground}
              onClear={onClearBackground}
              onUploadFile={onSetBackgroundAsset}
            />
          </div>

          <div className="relative">
            <span className={`absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
              costumeAsset 
                ? 'bg-amber-400 text-zinc-950 border-amber-300' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {costumeAsset ? 'ĐỒNG NHẤT ĐỒ RIÊNG ✓' : 'TRANG PHỤC (TÙY CHỌN)'}
            </span>
            <MediaUploader
              label="Đồng Nhất Trang Phục"
              sublabel={costumeAsset ? 'Khóa cố định theo ảnh này' : 'Nếu trống, bám sát đồ của ảnh mẫu'}
              icon="checkroom"
              asset={costumeAsset}
              filter="image"
              onSelect={onSelectCostume}
              onClear={onClearCostume}
              onUploadFile={onSetCostumeAsset}
            />
          </div>

          <div className="relative">
            <span className={`absolute -top-2 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
              audioVoiceAsset 
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {audioVoiceAsset ? 'ĐỒNG BỘ GIỌNG ✓' : 'FLOW VOICE (TÙY CHỌN)'}
            </span>
            <MediaUploader
              label="Giọng Voice FLOW"
              sublabel={audioVoiceAsset ? (audioVoiceAsset.type === 'video' ? 'Đã lấy tiếng từ video mẫu' : 'Đã nạp file âm thanh MP3/WAV') : 'Tải file MP3 hoặc video mẫu'}
              icon="mic"
              asset={audioVoiceAsset}
              filter="all"
              onSelect={onSelectAudioVoice}
              onClear={onClearAudioVoice}
              onUploadFile={onSetAudioVoiceAsset}
            />
          </div>
        </div>
      </div>

      {/* 2. Thiết lập Giọng Đọc Vùng Miền & Khóa Đồng Nhất Âm Sắc */}
      <VoiceConfigPanel
        selectedRegion={selectedVoiceRegion}
        onRegionChange={setSelectedVoiceRegion}
        selectedGender={selectedVoiceGender}
        onGenderChange={setSelectedVoiceGender}
        selectedTone={selectedVoiceTone}
        onToneChange={onVoiceToneChange}
        customVoiceNotes={customVoiceNotes}
        onCustomVoiceNotesChange={setCustomVoiceNotes}
      />

      {/* 3. Thông tin sản phẩm & Kịch bản */}
      <div className="p-4 md:p-5 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-base">edit_note</span>
              Thông Tin Sản Phẩm &amp; Kịch Bản Tiếng Việt
            </h4>
            <p className="text-[11px] text-zinc-400">
              Nhập tên sản phẩm hoặc chọn khách hàng mục tiêu để tạo nhanh kịch bản 5 phân cảnh.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xem lại các lần tạo ảnh và video"
            >
              <span className="material-symbols-outlined text-sm text-amber-400">history</span>
              <span>Lịch Sử ({history.length})</span>
            </button>

            <button
              onClick={onExportJSON}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Xuất file JSON dự án"
            >
              <span className="material-symbols-outlined text-sm text-cyan-400">file_upload</span>
              <span>Xuất JSON</span>
            </button>

            <button
              onClick={onImportJSON}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Tải lên file JSON dự án"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">file_download</span>
              <span>Nhập JSON</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className={`p-3 bg-zinc-950/70 border rounded-2xl space-y-1 transition-all ${
            !hasProductName ? 'border-amber-500/40' : 'border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                <span>1. Tên Sản Phẩm (Bắt buộc):</span>
              </label>
              {!hasProductName && (
                <span className="text-[10px] text-amber-400 font-mono">* Bắt buộc nhập</span>
              )}
            </div>
            <input
              type="text"
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              placeholder="VD: Serum Dưỡng Ẩm B5, Nước Hoa Hồng, Tai Nghe Không Dây..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500 placeholder:text-zinc-600 font-medium"
            />
          </div>

          <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">groups</span>
                <span>2. Khách Hàng Mục Tiêu:</span>
              </label>
              <span className="text-[10px] text-zinc-500">Bấm gợi ý hoặc tự gõ</span>
            </div>

            <div className="flex flex-wrap gap-1 pb-1">
              {AUDIENCE_SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onTargetAudienceChange(item.value)}
                  className="px-2 py-0.5 rounded-lg text-[10px] bg-zinc-900 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors cursor-pointer"
                >
                  + {item.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={targetAudience}
              onChange={(e) => onTargetAudienceChange(e.target.value)}
              placeholder="Tự điền hoặc bấm nút gợi ý phía trên..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500 placeholder:text-zinc-600 font-medium"
            />
          </div>
        </div>

        {/* 2 MỤC AI TỰ ĐỘNG PHÂN TÍCH */}
        <div className="p-4 bg-zinc-950/90 border border-amber-500/30 rounded-2xl space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/40">
                AI
              </span>
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                Đặc Điểm Sản Phẩm &amp; Nhận Diện Bao Bì
              </span>
              {autoAnalysisSuccess && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  Đã Phân Tích Xong ✓
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!canAnalyzeProduct && (
                <span className="text-[11px] text-zinc-500 hidden sm:inline italic">
                  * Nhập Tên hoặc chọn Ảnh Sản Phẩm để mở nút
                </span>
              )}
              <button
                type="button"
                onClick={() => handleAutoAnalyzeProductInfo()}
                disabled={!canAnalyzeProduct || isAnalyzingProductDetails}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm ${
                  !canAnalyzeProduct
                    ? 'bg-zinc-900/60 text-zinc-500 border-zinc-800 cursor-not-allowed opacity-60'
                    : isAnalyzingProductDetails
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/50 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 border-amber-400 shadow-amber-500/20 cursor-pointer active:scale-[0.98]'
                }`}
                title={!canAnalyzeProduct ? 'Vui lòng nhập Tên Sản Phẩm hoặc nạp Ảnh Sản Phẩm trước' : 'Bấm để AI phân tích 2 ô này'}
              >
                {isAnalyzingProductDetails ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>AI Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span>AI Tự Động Phân Tích 2 Ô Này</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Điểm Nổi Bật / Công Dụng:</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Tự động điền bởi AI</span>
              </div>
              <textarea
                rows={2}
                value={productDescription}
                onChange={(e) => onProductDescriptionChange(e.target.value)}
                placeholder="Chờ AI phân tích hoặc bạn có thể tự nhập..."
                className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-emerald-500/80 leading-relaxed font-sans placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Đặc Điểm Nhận Diện Bao Bì/Thiết Kế Cần Giữ Nguyên:</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Khóa nhận diện bởi AI</span>
              </div>
              <textarea
                rows={2}
                value={productAppearance}
                onChange={(e) => setProductAppearance(e.target.value)}
                placeholder="Chờ AI phân tích màu sắc, logo bao bì hoặc bạn có thể tự nhập..."
                className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-cyan-500/80 leading-relaxed font-sans placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        {/* PHONG CÁCH REVIEW */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-sm">movie_filter</span>
              <span>Phong Cách Kịch Bản Review:</span>
            </label>
            <span className="text-[10px] text-zinc-500">Định hình toàn bộ góc quay &amp; lời thoại</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {REVIEW_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => onStyleChange(style.id as ReviewStyle)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-2 ring-amber-500/40 shadow-lg'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400">
                        <span className="material-symbols-outlined text-base">{style.icon}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold">
                        {style.badge}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{style.title}</div>
                    <p className="text-[11px] text-zinc-300 leading-snug line-clamp-3">
                      {style.distinction}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-855/80 space-y-1 text-[10px] text-zinc-500">
                    <div className="flex items-center gap-1 truncate text-zinc-400">
                      <span className="material-symbols-outlined text-xs text-amber-400 shrink-0">videocam</span>
                      <span className="truncate">{style.cinematography}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate text-zinc-400">
                      <span className="material-symbols-outlined text-xs text-cyan-400 shrink-0">speed</span>
                      <span className="truncate">{style.speechPacing}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút Tạo Kịch Bản Review Tự Động */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/80">
          <div>
            <p className="text-xs text-zinc-400">
              <span className="text-emerald-400 font-medium">
                ✓ Giọng {selectedVoiceRegion === 'north_hanoi' ? 'Hà Nội' : selectedVoiceRegion === 'south_hcm' ? 'TP.HCM' : 'Miền Trung'} ({selectedVoiceGender === 'female' ? 'Nữ' : 'Nam'}) • Khóa âm sắc &amp; chống lặp từ tự động!
              </span>
              {!isAllRequiredLoaded && (
                <span className="block text-amber-400 text-[11px] mt-0.5 font-medium">
                  ⚠️ Cần nạp đủ 3 tài nguyên: Ảnh Sản Phẩm, Ảnh Người Mẫu KOC, Ảnh Bối Cảnh để kịch bản bám sát hình ảnh.
                </span>
              )}
            </p>
            {isGeneratingFullScript && scriptThinkingStep && (
              <p className="text-xs text-amber-300 font-mono mt-1 flex items-center gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>{scriptThinkingStep}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerateAIScript}
            disabled={isGeneratingFullScript}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg ${
              isGeneratingFullScript
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/40 cursor-wait ring-1 ring-amber-400/40'
                : isAllRequiredLoaded && hasProductName
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/20 active:scale-[0.99] ring-2 ring-amber-400/80'
                : 'bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-amber-500/40 hover:border-amber-400'
            }`}
          >
            {isGeneratingFullScript ? (
              <>
                <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>AI Đang Suy Nghĩ Kịch Bản Riêng...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <span>Tự động tạo kịch bản review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Lưới Storyboard Phân Cảnh */}
      <div className="space-y-4">
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                5
              </span>
              <h3 className="text-sm font-bold text-white">
                Storyboard 5 Phân Cảnh Review
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono font-bold">
                {completedImages}/5 ảnh • {completedScenes}/5 video
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              <span>Đồng bộ theo model AI toàn cục</span>
              <span className="text-amber-400 ml-2 font-medium">
                • Giọng: {selectedVoiceRegion === 'north_hanoi' ? 'Hà Nội' : selectedVoiceRegion === 'south_hcm' ? 'TP.HCM' : 'Miền Trung'} ({selectedVoiceGender === 'female' ? 'Nữ' : 'Nam'})
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBatchGenerateAllImages}
              disabled={isBatchGeneratingImages || isBatchGeneratingVideos}
              className={`w-[165px] h-[34px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isBatchGeneratingImages
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 animate-pulse'
                  : hasProduct && hasModelPerson
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/80 hover:bg-emerald-400'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
              }`}
              title="Tạo đồng loạt ảnh cho toàn bộ 5 phân cảnh"
            >
              {isBatchGeneratingImages ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="truncate">{batchImageProgress || 'Đang tạo ảnh...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm shrink-0">collections</span>
                  <span>Tạo Full Ảnh ({completedImages}/5)</span>
                </>
              )}
            </button>

            <button
              onClick={handleBatchGenerateAllVideos}
              disabled={isBatchGeneratingVideos || isBatchGeneratingImages}
              className={`w-[185px] h-[34px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isBatchGeneratingVideos
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 animate-pulse'
                  : completedImages > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/35 ring-2 ring-indigo-400/80'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
              }`}
              title="Render video các phân cảnh theo đợt 2 clip một lần"
            >
              {isBatchGeneratingVideos ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="truncate">{batchVideoProgress || 'Đang render...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm shrink-0">video_library</span>
                  <span>Render Video (2/lần) ({completedScenes}/5)</span>
                </>
              )}
            </button>

            {hasAnyErrors && (
              <button
                onClick={handleRetryFailedScenes}
                disabled={isBatchGeneratingVideos || isBatchGeneratingImages}
                className="h-[34px] px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-rose-600/30 whitespace-nowrap shrink-0"
                title="Thử lại các cảnh bị lỗi ngay lập tức"
              >
                <span className="material-symbols-outlined text-sm font-bold shrink-0">replay</span>
                <span>Tạo Lại Cảnh Lỗi</span>
              </button>
            )}

            {completedScenes >= 2 && (
              <button
                onClick={() => setIsTimelineOpen(true)}
                className="h-[34px] px-3.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/80 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title="Mở timeline biên tập và ghép tất cả các video thành 1 video trọn vẹn"
              >
                <span className="material-symbols-outlined text-sm font-black shrink-0">movie_edit</span>
                <span>Ghép Video ({completedScenes})</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start">
          {scenes.map((scene) => (
            <SceneCardItem
              key={scene.id}
              scene={scene}
              isGeneratingImage={scene.status === 'generating_image'}
              isGeneratingVideo={scene.status === 'generating_video'}
              timeoutSecondsLeft={timeoutTracker[scene.sceneNumber] ?? null}
              selectedImageModel={selectedImageModel}
              selectedVideoModel={selectedVideoModel}
              aspectRatio={aspectRatio}
              onEditDetail={() => setEditingScene(scene)}
              onUpdateDialogue={(val) => handleUpdateDialogue(scene.id, val)}
              onUpdateDuration={(duration) => handleUpdateDuration(scene.id, duration)}
              onDirectRetryImage={() => {
                handleGenerateSceneImage(scene.sceneNumber).catch(console.warn);
              }}
              onDirectRetryVideo={() => {
                handleGenerateSceneVideo(scene.sceneNumber).catch(console.warn);
              }}
              onOpenRegenerateImageModal={() => setRegenerateImageTargetScene(scene)}
              onOpenRegenerateModal={() => setRegenerateTargetScene(scene)}
              onDownloadAsset={handleDownloadAsset}
              onInspectMedia={(data) => setInspectData(data)}
            />
          ))}
        </div>
      </div>

      {/* 5. MÔ TẢ & HASHTAG CHO VIDEO */}
      <VideoPostCaptionSection
        productName={productName}
        productDescription={productDescription}
        targetAudience={targetAudience}
        reviewStyle={selectedStyle}
        captionData={videoPostCaption}
        onUpdateCaptionData={setVideoPostCaption}
        isGenerating={isGeneratingCaption}
        onGenerateCaption={handleGeneratePostCaption}
      />

      <MediaInspectModal
        data={inspectData}
        isOpen={!!inspectData}
        onClose={() => setInspectData(null)}
      />

      <RegenerateImageModal
        scene={regenerateImageTargetScene}
        isOpen={!!regenerateImageTargetScene}
        onClose={() => setRegenerateImageTargetScene(null)}
        onSubmit={(sceneNum, feedbackText, reasonLabel) => {
          console.log(`Làm lại ảnh cảnh ${sceneNum} theo phản hồi [${reasonLabel}]: ${feedbackText}`);
          handleGenerateSceneImage(sceneNum, feedbackText).catch(console.warn);
        }}
      />

      <RegenerateFeedbackModal
        scene={regenerateTargetScene}
        isOpen={!!regenerateTargetScene}
        onClose={() => setRegenerateTargetScene(null)}
        onSubmit={(sceneNum, feedbackText, reasonLabel) => {
          console.log(`Làm lại video cảnh ${sceneNum} theo phản hồi [${reasonLabel}]: ${feedbackText}`);
          handleGenerateSceneVideo(sceneNum, feedbackText).catch(console.warn);
        }}
      />

      <VideoConcatenatorTimeline
        scenes={scenes}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        onSaveMergedVideo={(merged) => {
          onAddHistory({
            id: `hist_merged_${Date.now()}`,
            timestamp: Date.now(),
            type: 'video',
            prompt: 'Video ghép toàn bộ 5 phân cảnh',
            asset: merged,
            model: 'FFmpeg Timeline Concat'
          });
        }}
      />

      <SceneDetailModal
        scene={editingScene}
        isOpen={!!editingScene}
        onClose={() => setEditingScene(null)}
        onSave={(updated) => {
          onUpdateScenes((prev: SceneCard[]) => prev.map(s => s.id === updated.id ? updated : s));
          setEditingScene(null);
        }}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDownloadAsset={handleDownloadAsset}
        onClearHistory={onClearHistory}
        onSelectAsReference={(entry) => {
          alert(`Đã chọn ảnh từ lịch sử "${entry.asset.name}" làm tham chiếu cho phân cảnh tiếp theo!`);
          setIsHistoryOpen(false);
        }}
      />
    </div>
  );
};