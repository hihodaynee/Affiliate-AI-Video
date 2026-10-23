import type { MediaAsset } from '../types';

export interface AsmrBeat {
  start: number;
  end: number;
  action: string;
  camera: string;
  sound: string;
}

export interface AsmrScene {
  id: string;
  title: string;
  purpose: string;
  durationSeconds: 4 | 6 | 8 | 10;
  audioMode: 'asmr' | 'voiceover';
  narration: string;
  beats: AsmrBeat[];
  status: 'idle' | 'generating' | 'done' | 'error';
  error?: string;
  video: MediaAsset | null;
  audioReview: 'pending' | 'approved' | 'rejected';
}

export interface AsmrProject {
  kind: 'asmr_review';
  version: 1;
  product: MediaAsset | null;
  extraImage: MediaAsset | null;
  productName: string;
  productFacts: string;
  demonstratedActions: string;
  setting: 'warm_desk' | 'clean_studio';
  aspectRatio: '9:16' | '16:9';
  resolution: '720p' | '360p';
  videoModel: string;
  narrationMode: 'none' | 'alternating';
  voiceDirection: string;
  description: string;
  creativeReasoning: string;
  planInputKey: string;
  uncertainties: string[];
  scenes: AsmrScene[];
  mergedVideo: MediaAsset | null;
}

export function createAsmrProject(): AsmrProject {
  return {
    kind: 'asmr_review', version: 1, product: null, extraImage: null,
    productName: '', productFacts: '', demonstratedActions: '', setting: 'warm_desk',
    aspectRatio: '9:16', resolution: '720p', videoModel: 'Omni 1.1 Flash',
    narrationMode: 'none', voiceDirection: 'Giọng Việt tự nhiên, nhẹ nhàng, rõ chữ, không thì thầm.',
    description: '', creativeReasoning: '', planInputKey: '', uncertainties: [], scenes: [], mergedVideo: null,
  };
}
