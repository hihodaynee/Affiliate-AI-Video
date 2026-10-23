export type AppTab = 'character_studio' | 'product_script' | 'motion_cloner';

export type ToolMode = 'product_script' | 'motion_cloner';

export type Gender = 'female' | 'male' | 'non-binary';

export interface CharacterAttributes {
  gender: Gender;
  age: number;
  ethnicity: string;
  bodyType: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  facialFeatures: string;
  makeupStyle: string;
  professionOrVibe: string;
  outfit: string;
  accessories: string;
  expression: string;
  setting: string;
  lighting: string;
  cameraLens: string;
  aspectRatio: '1:1' | '9:16' | '16:9' | '3:4' | '4:3';
  otherFeatures: string;
}

export interface GeneratedHistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  aspectRatio: '1:1' | '9:16' | '16:9' | '3:4' | '4:3';
  imageUrl?: string;
  mediaId?: string;
  model: string;
  attributes: CharacterAttributes;
}

export interface CharacterPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  attributes: Partial<CharacterAttributes>;
}

export interface MediaAsset {
  mediaId: string;
  base64: string;
  mimeType: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  previewUrl: string;
}

export type ReviewStyle = 
  | 'tiktok_ugc' 
  | 'luxury_commercial' 
  | 'problem_solution' 
  | 'unboxing_asmr' 
  | 'expert_medical';

export type VoiceTone = 
  | 'warm_natural' 
  | 'tiktok_energetic' 
  | 'luxury_calm' 
  | 'urgent_sale' 
  | 'expert_trusted';

export type VoiceRegion = 
  | 'north_hanoi' 
  | 'south_hcm' 
  | 'central_hue_danang';

export type VoiceGender = 'female' | 'male';

export interface VoiceProfileConfig {
  region: VoiceRegion;
  gender: VoiceGender;
  style: VoiceTone;
  detailedAcousticPrompt: string;
  customNotes?: string;
}

export interface SceneCard {
  id: string;
  sceneNumber: number;
  stageName: string;
  title: string;
  durationSeconds: 4 | 6 | 8 | 10;
  estimatedSpeechDurationSec?: number;
  cameraAngle: string;
  moodTag: string;
  visualKeypoints: string;
  productVisualDetails?: string;
  costumeDetails?: string;
  dialogue: string;
  actingGuide: string;
  imagePrompt: string;
  videoPrompt: string;
  voiceGuidance: string;
  generatedImage: MediaAsset | null;
  generatedVideo: MediaAsset | null;
  status: 'idle' | 'generating_image' | 'generating_video' | 'done' | 'error';
  errorMessage?: string;
}

export interface GenerationHistoryEntry {
  id: string;
  timestamp: number;
  type: 'image' | 'video';
  sceneNumber?: number;
  prompt: string;
  asset: MediaAsset;
  model: string;
}

export interface VideoCaptionData {
  title: string;
  hookCaption: string;
  detailedCaption: string;
  ctaText: string;
  hashtags: string[];
}