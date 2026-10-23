import React, { useState } from 'react';
import { Flow } from 'flow-sdk';
import { 
  AppTab, 
  CharacterAttributes, 
  GeneratedHistoryItem, 
  MediaAsset, 
  SceneCard, 
  ReviewStyle, 
  VoiceTone, 
  GenerationHistoryEntry 
} from './types';
import { 
  DEFAULT_ATTRIBUTES, 
  POPULAR_PRESETS, 
  DEFAULT_STORYBOARD_STAGES 
} from './constants';
import { buildCharacterPrompt } from './utils/promptBuilder';
import { AttributesForm } from './components/AttributesForm';
import { PromptDisplay } from './components/PromptDisplay';
import { ImageAnalyzerModal } from './components/ImageAnalyzerModal';
import { HistoryModal } from './components/HistoryModal';
import { ImageZoomModal } from './components/ImageZoomModal';
import { ProductScriptStudio } from './components/ProductScriptStudio';
import { MotionClonerAuto } from './components/MotionClonerAuto';
import { InfoModal } from './components/InfoModal';
import { GlobalModelSettingsModal } from './components/GlobalModelSettingsModal';

const IMAGE_MODEL_DEFAULT = '🍌 Nano Banana Pro';
const VIDEO_MODEL_DEFAULT = 'Omni 1.1 Flash';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('character_studio');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState<boolean>(false);

  // ==================== GLOBAL AI MODEL SETTINGS (DÙNG CHUNG CẢ 3 CHỨC NĂNG) ====================
  const [globalImageModel, setGlobalImageModel] = useState<string>(IMAGE_MODEL_DEFAULT);
  const [globalVideoModel, setGlobalVideoModel] = useState<string>(VIDEO_MODEL_DEFAULT);

  // ==================== 1. AI KOC & CHARACTER FORGE STATE ====================
  const [attributes, setAttributes] = useState<CharacterAttributes>(DEFAULT_ATTRIBUTES);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('viet_ugc_girl');
  const [isGeneratingChar, setIsGeneratingChar] = useState<boolean>(false);
  const [currentResultImage, setCurrentResultImage] = useState<string | null>(null);
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [charErrorMessage, setCharErrorMessage] = useState<string | null>(null);
  const [charHistory, setCharHistory] = useState<GeneratedHistoryItem[]>([]);
  const [isCharHistoryOpen, setIsCharHistoryOpen] = useState<boolean>(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [zoomPreviewUrl, setZoomPreviewUrl] = useState<string | null>(null);

  // ==================== 2. AI PRODUCT SCRIPT REVIEW STATE ====================
  const [productAsset, setProductAsset] = useState<MediaAsset | null>(null);
  const [modelPersonAsset, setModelPersonAsset] = useState<MediaAsset | null>(null);
  const [costumeAsset, setCostumeAsset] = useState<MediaAsset | null>(null);
  const [backgroundAsset, setBackgroundAsset] = useState<MediaAsset | null>(null);
  const [audioVoiceAsset, setAudioVoiceAsset] = useState<MediaAsset | null>(null);

  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ReviewStyle>('tiktok_ugc');
  const [selectedVoiceTone, setSelectedVoiceTone] = useState<VoiceTone>('tiktok_energetic');

  const [scenes, setScenes] = useState<SceneCard[]>(() => 
    DEFAULT_STORYBOARD_STAGES.map((s, idx) => ({
      id: `init_scene_${idx}`,
      sceneNumber: idx + 1,
      stageName: s.stageName,
      title: s.title,
      durationSeconds: s.durationSeconds,
      cameraAngle: s.cameraAngle,
      moodTag: s.moodTag,
      visualKeypoints: s.visualKeypoints,
      productVisualDetails: s.productVisualDetails,
      costumeDetails: '',
      dialogue: '',
      actingGuide: s.actingGuide,
      imagePrompt: s.imagePrompt,
      videoPrompt: s.videoPrompt,
      voiceGuidance: s.voiceGuidance,
      generatedImage: null,
      generatedVideo: null,
      status: 'idle'
    }))
  );

  const [scriptHistory, setScriptHistory] = useState<GenerationHistoryEntry[]>([]);
  const [scriptAspectRatio, setScriptAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [scriptResolution, setScriptResolution] = useState<'720p' | '360p'>('720p');

  // ==================== 3. MOTION CLONER AUTO STATE ====================
  const [clonerSourceVideo, setClonerSourceVideo] = useState<MediaAsset | null>(null);
  const [clonerCharacterAsset, setClonerCharacterAsset] = useState<MediaAsset | null>(null);
  const [clonerOutfitAsset, setClonerOutfitAsset] = useState<MediaAsset | null>(null);
  const [clonerResolution, setClonerResolution] = useState<'720p' | '360p'>('720p');

  // ==================== TẠO NHÂN VẬT VỚI GLOBAL IMAGE MODEL ====================
  const handleGenerateCharacter = async () => {
    setIsGeneratingChar(true);
    setCharErrorMessage(null);
    const promptText = buildCharacterPrompt(attributes);

    try {
      const result = await Flow.generate.image({
        prompt: promptText,
        modelDisplayName: globalImageModel,
        aspectRatio: attributes.aspectRatio
      });

      const dataUrl = `data:${result.mimeType};base64,${result.base64}`;
      setCurrentResultImage(dataUrl);
      setCurrentMediaId(result.mediaId);

      const newHistoryItem: GeneratedHistoryItem = {
        id: `hist_${Date.now()}`,
        timestamp: Date.now(),
        prompt: promptText,
        aspectRatio: attributes.aspectRatio,
        imageUrl: dataUrl,
        mediaId: result.mediaId,
        model: globalImageModel,
        attributes: { ...attributes }
      };
      setCharHistory(prev => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error('Lỗi tạo ảnh:', err);
      const msg = err.message || 'Không thể tạo ảnh lúc này.';
      if (msg.includes('hạn mức') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        setCharErrorMessage(`Hạn mức của model ${globalImageModel} đã tạm hết. Vui lòng bấm vào biểu tượng cài đặt ⚙️ trên thanh tiêu đề để chuyển sang Nano Banana 2 Lite.`);
      } else {
        setCharErrorMessage(msg);
      }
    } finally {
      setIsGeneratingChar(false);
    }
  };

  const handleSendCharacterToScriptReview = () => {
    if (!currentMediaId || !currentResultImage) {
      alert('Vui lòng tạo chân dung nhân vật trước!');
      return;
    }

    const base64Data = currentResultImage.split(',')[1];
    const mimeMatch = currentResultImage.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const kocAsset: MediaAsset = {
      mediaId: currentMediaId,
      base64: base64Data,
      mimeType: mimeType,
      name: `KOC_${attributes.ethnicity.replace(/\s+/g, '_')}_${attributes.professionOrVibe || 'Creator'}`,
      type: 'image',
      previewUrl: currentResultImage
    };

    setModelPersonAsset(kocAsset);
    setActiveTab('product_script');
  };

  const handleSendCharacterToMotionCloner = () => {
    if (!currentMediaId || !currentResultImage) {
      alert('Vui lòng tạo chân dung nhân vật trước!');
      return;
    }

    const base64Data = currentResultImage.split(',')[1];
    const mimeMatch = currentResultImage.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const kocAsset: MediaAsset = {
      mediaId: currentMediaId,
      base64: base64Data,
      mimeType: mimeType,
      name: `KOC_${attributes.ethnicity.replace(/\s+/g, '_')}`,
      type: 'image',
      previewUrl: currentResultImage
    };

    setClonerCharacterAsset(kocAsset);
    setActiveTab('motion_cloner');
  };

  const handleSelectMedia = async (filter: 'image' | 'video' | 'audio' | 'all', onDone: (asset: MediaAsset) => void) => {
    try {
      const media = await Flow.media.select({ filter: filter as any });
      if (media) {
        let preview = `data:${media.mimeType};base64,${media.base64}`;
        if (media.type === 'video' || media.mimeType.startsWith('video/')) {
          const bytes = Uint8Array.from(atob(media.base64), c => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: media.mimeType });
          preview = URL.createObjectURL(blob);
        } else if (media.type === 'audio' || media.mimeType.startsWith('audio/')) {
          const bytes = Uint8Array.from(atob(media.base64), c => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: media.mimeType });
          preview = URL.createObjectURL(blob);
        }

        onDone({
          mediaId: media.mediaId,
          base64: media.base64,
          mimeType: media.mimeType,
          name: media.name || 'Media Asset',
          type: media.type,
          previewUrl: preview
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportScriptJSON = async () => {
    try {
      const exportData = {
        productName,
        productDescription,
        targetAudience,
        selectedStyle,
        selectedVoiceTone,
        scenes,
        exportedAt: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const bytes = new TextEncoder().encode(jsonStr);
      const base64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
      await Flow.download({
        base64,
        mimeType: 'application/json',
        filename: `Affiliate_Script_${productName ? productName.replace(/[^a-zA-Z0-9_\-]/g, '_') : 'Draft'}.json`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportScriptJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.scenes && Array.isArray(parsed.scenes)) {
            setProductName(parsed.productName || productName);
            setProductDescription(parsed.productDescription || productDescription);
            setTargetAudience(parsed.targetAudience || targetAudience);
            setScenes(parsed.scenes);
            alert('Đã khôi phục thành công kịch bản từ file JSON!');
          }
        } catch {
          alert('Không thể đọc file JSON kịch bản.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Header Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-3 sm:px-5 py-2.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Logo + Tên App */}
          <div className="flex items-center justify-between w-full lg:w-auto min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 shrink-0">
                <span className="material-symbols-outlined text-xl font-black">movie_filter</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-white tracking-wide truncate">
                    Affiliate AI Video
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    v1.0
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">by hitechmmo</span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate hidden sm:block">
                  Hệ Thống Tự Động Sản Xuất Video KOC AI &amp; Review Bán Hàng Affiliate
                </p>
              </div>
            </div>

            {/* Khối liên kết mạng xã hội chính thức trên header */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <a
                href="https://www.facebook.com/profile.php?id=61594632656414"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/80 hover:bg-blue-600/20 border border-zinc-800 hover:border-blue-500/40 text-zinc-300 hover:text-blue-400 text-[11px] font-medium transition-all"
                title="Facebook: Hi Tech MMO"
              >
                <span className="material-symbols-outlined text-sm text-blue-400">public</span>
                <span className="hidden md:inline">Facebook</span>
              </a>

              <a
                href="https://www.tiktok.com/@hi.tech.mmo"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/80 hover:bg-pink-600/20 border border-zinc-800 hover:border-pink-500/40 text-zinc-300 hover:text-pink-400 text-[11px] font-medium transition-all"
                title="TikTok: @hi.tech.mmo"
              >
                <span className="material-symbols-outlined text-sm text-pink-400">music_note</span>
                <span className="hidden md:inline">TikTok</span>
              </a>

              <a
                href="https://www.hitechdev.site/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/80 hover:bg-amber-600/20 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 text-[11px] font-medium transition-all"
                title="Website: hitechdev.site"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">language</span>
                <span className="hidden md:inline">Website</span>
              </a>
            </div>
          </div>

          {/* Module Switcher Tabs + Duy nhất 1 Icon Cài Đặt Gọn Gàng */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-full shrink-0">
            <button
              onClick={() => setActiveTab('character_studio')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'character_studio'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">face_retouching_natural</span>
              <span>Tạo Nhân Vật KOC</span>
            </button>

            <button
              onClick={() => setActiveTab('product_script')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'product_script'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">movie_creation</span>
              <span>Review Bán Hàng</span>
            </button>

            <button
              onClick={() => setActiveTab('motion_cloner')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'motion_cloner'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">directions_bike</span>
              <span>Sao Chép Chuyển Động</span>
            </button>

            {/* DUY NHẤT 1 ICON CÀI ĐẶT DUY NHẤT TRÊN TOP HEADER - KHÔNG CÓ NÚT/CHỮ THỪA */}
            <button
              onClick={() => setIsGlobalSettingsOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer ml-1"
              title="Cài đặt Model AI chung (Ảnh & Video)"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>

            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer ml-0.5"
              title="Hướng dẫn & Thông tin Affiliate AI Video v1.0 by hitechmmo"
            >
              <span className="material-symbols-outlined text-base">help</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* ==================== TAB 1: TẠO NHÂN VẬT KOC ==================== */}
        {activeTab === 'character_studio' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-indigo-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold border border-amber-500/30">
                  <span className="material-symbols-outlined text-base">face_retouching_natural</span>
                </span>
                <div>
                  <p className="text-xs font-bold text-white">Bước khởi đầu: Thiết kế chân dung KOC AI</p>
                  <p className="text-[11px] text-zinc-400">
                    Chân dung KOC tạo tại đây có thể chuyển thẳng sang Review Bán Hàng hoặc Sao Chép Chuyển Động.
                  </p>
                </div>
              </div>

              {currentResultImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendCharacterToScriptReview}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">movie_creation</span>
                    <span>Đưa Vào Review Bán Hàng</span>
                  </button>

                  <button
                    onClick={handleSendCharacterToMotionCloner}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">directions_bike</span>
                    <span>Sao Chép Chuyển Động</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 md:p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-base">auto_fix_normal</span>
                    Mẫu Nhân Vật KOC Thịnh Hành
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Chọn mẫu KOC sẵn có để nạp nhanh toàn bộ thông số chuẩn hoặc tự do tùy chỉnh
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAnalyzerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">document_scanner</span>
                    <span>Phân Tích Ảnh Mẫu Bằng AI</span>
                  </button>

                  <button
                    onClick={() => setIsCharHistoryOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-amber-400">history</span>
                    <span>Lịch Sử ({charHistory.length})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {POPULAR_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPresetId(p.id);
                        if (p.attributes) {
                          setAttributes(prev => ({ ...prev, ...p.attributes }));
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40 shadow-sm'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 font-semibold">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <AttributesForm
                  attributes={attributes}
                  onChange={setAttributes}
                  onResetToDefault={() => setAttributes(DEFAULT_ATTRIBUTES)}
                />
              </div>

              <div className="lg:col-span-5 space-y-5 sticky top-20">
                <PromptDisplay
                  attributes={attributes}
                  isGenerating={isGeneratingChar}
                  onGenerateImage={handleGenerateCharacter}
                  onExportJSON={async () => {
                    const exportData = { characterAttributes: attributes, generatedPrompt: buildCharacterPrompt(attributes) };
                    const jsonStr = JSON.stringify(exportData, null, 2);
                    const bytes = new TextEncoder().encode(jsonStr);
                    const base64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
                    await Flow.download({
                      base64,
                      mimeType: 'application/json',
                      filename: `AI_KOC_${attributes.ethnicity.replace(/\s+/g, '_')}.json`
                    });
                  }}
                  onImportJSON={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json,application/json';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const p = JSON.parse(ev.target?.result as string);
                          if (p.characterAttributes) setAttributes(p.characterAttributes);
                        } catch {}
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                />

                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 md:p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-lg">smart_toy</span>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Kết Quả Chân Dung Nhân Vật AI
                      </h3>
                    </div>
                    {currentResultImage && (
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        Đã lưu Gallery
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-black aspect-[9/13] border border-zinc-800 flex items-center justify-center relative group">
                    {isGeneratingChar ? (
                      <div className="text-center p-6 space-y-3">
                        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-bold text-zinc-200">Đang khởi tạo nhân vật KOC...</p>
                        <p className="text-[11px] text-zinc-500 max-w-xs">
                          Sử dụng model {globalImageModel}.
                        </p>
                      </div>
                    ) : currentResultImage ? (
                      <>
                        <img
                          src={currentResultImage}
                          alt="Generated AI KOC"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                          <button
                            onClick={() => {
                              setZoomPreviewUrl(currentResultImage);
                              setIsZoomOpen(true);
                            }}
                            className="p-3 bg-zinc-900/90 hover:bg-black text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold shadow-xl border border-zinc-700 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">zoom_in</span>
                            <span>Phóng to kiểm tra chi tiết</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-zinc-600 space-y-2">
                        <span className="material-symbols-outlined text-5xl">face</span>
                        <p className="text-xs">Chưa có ảnh nhân vật KOC.</p>
                        <p className="text-[11px] text-zinc-500 max-w-xs">
                          Bấm nút &ldquo;Tạo Chân Dung Nhân Vật AI&rdquo; ở trên để chạy ảnh đầu tiên.
                        </p>
                      </div>
                    )}
                  </div>

                  {charErrorMessage && (
                    <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base shrink-0">error</span>
                        <span>{charErrorMessage}</span>
                      </div>
                      <button
                        onClick={() => setIsGlobalSettingsOpen(true)}
                        className="p-1 hover:bg-red-900/60 rounded-lg text-white transition-colors cursor-pointer shrink-0"
                        title="Mở cài đặt"
                      >
                        <span className="material-symbols-outlined text-base">settings</span>
                      </button>
                    </div>
                  )}

                  {currentResultImage && (
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={handleSendCharacterToScriptReview}
                        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base font-bold">movie_creation</span>
                        <span>Đưa Người Mẫu Này Sang Review Bán Hàng</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setZoomPreviewUrl(currentResultImage);
                            setIsZoomOpen(true);
                          }}
                          className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">zoom_in</span>
                          <span>Phóng to</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (!currentResultImage) return;
                            const base64 = currentResultImage.split(',')[1];
                            await Flow.download({
                              base64,
                              mimeType: 'image/jpeg',
                              filename: `AI_KOC_${Date.now()}.jpg`
                            });
                          }}
                          className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>Tải về</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: REVIEW BÁN HÀNG ==================== */}
        {activeTab === 'product_script' && (
          <div className="space-y-6 animate-fadeIn">
            <ProductScriptStudio
              productAsset={productAsset}
              modelPersonAsset={modelPersonAsset}
              costumeAsset={costumeAsset}
              backgroundAsset={backgroundAsset}
              audioVoiceAsset={audioVoiceAsset}
              onSelectProduct={() => handleSelectMedia('image', setProductAsset)}
              onClearProduct={() => setProductAsset(null)}
              onSelectModelPerson={() => handleSelectMedia('image', setModelPersonAsset)}
              onClearModelPerson={() => setModelPersonAsset(null)}
              onSelectCostume={() => handleSelectMedia('image', setCostumeAsset)}
              onClearCostume={() => setCostumeAsset(null)}
              onSelectBackground={() => handleSelectMedia('image', setBackgroundAsset)}
              onClearBackground={() => setBackgroundAsset(null)}
              onSelectAudioVoice={() => handleSelectMedia('all', setAudioVoiceAsset)}
              onClearAudioVoice={() => setAudioVoiceAsset(null)}
              onSetProductAsset={setProductAsset}
              onSetModelPersonAsset={setModelPersonAsset}
              onSetCostumeAsset={setCostumeAsset}
              onSetBackgroundAsset={setBackgroundAsset}
              onSetAudioVoiceAsset={setAudioVoiceAsset}
              productName={productName}
              onProductNameChange={setProductName}
              productDescription={productDescription}
              onProductDescriptionChange={setProductDescription}
              targetAudience={targetAudience}
              onTargetAudienceChange={setTargetAudience}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              selectedVoiceTone={selectedVoiceTone}
              onVoiceToneChange={setSelectedVoiceTone}
              scenes={scenes}
              onUpdateScenes={setScenes}
              history={scriptHistory}
              onAddHistory={(entry) => setScriptHistory(prev => [entry, ...prev])}
              onClearHistory={() => setScriptHistory([])}
              selectedImageModel={globalImageModel}
              onImageModelChange={setGlobalImageModel}
              selectedVideoModel={globalVideoModel}
              onVideoModelChange={setGlobalVideoModel}
              aspectRatio={scriptAspectRatio}
              onAspectRatioChange={setScriptAspectRatio}
              resolution={scriptResolution}
              onResolutionChange={setScriptResolution}
              onExportJSON={handleExportScriptJSON}
              onImportJSON={handleImportScriptJSON}
            />
          </div>
        )}

        {/* ==================== TAB 3: SAO CHÉP CHUYỂN ĐỘNG ==================== */}
        {activeTab === 'motion_cloner' && (
          <MotionClonerAuto
            sourceVideoAsset={clonerSourceVideo}
            characterAsset={clonerCharacterAsset}
            outfitAsset={clonerOutfitAsset}
            onSelectSourceVideo={() => handleSelectMedia('video', setClonerSourceVideo)}
            onClearSourceVideo={() => setClonerSourceVideo(null)}
            onSelectCharacter={() => handleSelectMedia('image', setClonerCharacterAsset)}
            onClearCharacter={() => setClonerCharacterAsset(null)}
            onSelectOutfit={() => handleSelectMedia('image', setClonerOutfitAsset)}
            onClearOutfit={() => setClonerOutfitAsset(null)}
            selectedVideoModel={globalVideoModel}
            onVideoModelChange={setGlobalVideoModel}
            selectedImageModel={globalImageModel}
            onImageModelChange={setGlobalImageModel}
            resolution={clonerResolution}
            onResolutionChange={setClonerResolution}
            onAddResultVideo={(asset) => {
              setScriptHistory(prev => [{
                id: `hist_${Date.now()}`,
                timestamp: Date.now(),
                type: 'video',
                prompt: 'Sao Chép Chuyển Động',
                asset,
                model: globalVideoModel
              }, ...prev]);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/95 px-4 py-4 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <p className="leading-relaxed">
            Affiliate AI Video v1.0 • by <strong className="text-amber-400">hitechmmo</strong> • Google Flow Tool
          </p>
        </div>
      </footer>

      {/* Modal Cài Đặt Chung */}
      <GlobalModelSettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
        selectedImageModel={globalImageModel}
        onImageModelChange={setGlobalImageModel}
        selectedVideoModel={globalVideoModel}
        onVideoModelChange={setGlobalVideoModel}
      />

      <ImageAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
        onApplyAttributes={(analyzed) => {
          setAttributes(prev => ({ ...prev, ...analyzed }));
        }}
      />

      <HistoryModal
        isOpen={isCharHistoryOpen}
        onClose={() => setIsCharHistoryOpen(false)}
        history={charHistory}
        onRestoreAttributes={(item) => {
          setAttributes(item.attributes);
          setIsCharHistoryOpen(false);
        }}
        onSelectForPreview={(item) => {
          if (item.imageUrl) {
            setZoomPreviewUrl(item.imageUrl);
            setIsZoomOpen(true);
          }
        }}
        onClearHistory={() => setCharHistory([])}
      />

      <ImageZoomModal
        imageUrl={zoomPreviewUrl}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />

      <InfoModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}