// Local contract for calls used by this project. Runtime implementation is supplied
// by Google Flow; these declarations do not implement or guarantee SDK capabilities.
declare module 'flow-sdk' {
  interface FlowMedia {
    mediaId: string;
    base64: string;
    mimeType: string;
    name?: string;
    type: 'image' | 'video' | 'audio';
  }
  interface GenerationOptions {
    prompt: string;
    modelDisplayName: string;
    aspectRatio?: string;
    resolution?: string;
    durationSeconds?: number;
    referenceImageMediaIds?: string[];
    audioReferenceMediaIds?: string[];
    sourceVideoMediaId?: string;
    sourceVideoMode?: string;
  }
  export const Flow: {
    upload(options: {base64: string; mimeType: string; name: string}): Promise<FlowMedia>;
    download(options: {base64: string; mimeType: string; filename: string}): Promise<void>;
    media: {select(options: {filter: 'image' | 'video' | 'audio' | 'all'}): Promise<FlowMedia | null>};
    generate: {
      image(options: GenerationOptions): Promise<FlowMedia>;
      video(options: GenerationOptions): Promise<FlowMedia>;
      text(prompt: string, options?: {
        systemInstruction?: string;
        images?: Array<{base64: string; mimeType: string}>;
        videos?: Array<{base64: string; mimeType: string; fps?: number}>;
      }): Promise<{text: string}>;
    };
  };
}
