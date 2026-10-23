import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Flow } from 'flow-sdk';
import { ProductScriptStudio } from '../components/ProductScriptStudio';
import { SceneDetailModal } from '../components/SceneDetailModal';
import { RegenerateImageModal } from '../components/RegenerateImageModal';
import { RegenerateFeedbackModal } from '../components/RegenerateFeedbackModal';
import { buildFallbackScenes } from '../utils/productPrompts';
import type { MediaAsset, SceneCard } from '../types';

vi.mock('../components/SceneCardItem', () => ({SceneCardItem: (props: {scene:SceneCard;onDirectRetryVideo:()=>void;onDirectRetryImage:()=>void}) => <div>
  <button onClick={props.onDirectRetryVideo}>render-{props.scene.sceneNumber}</button>
  <button onClick={props.onDirectRetryImage}>image-{props.scene.sceneNumber}</button>
  <span>{props.scene.errorMessage}</span>
</div>}));

const asset: MediaAsset = {mediaId:'remote-image',base64:'YWJj',mimeType:'image/png',type:'image',name:'reference',previewUrl:'data:image/png;base64,YWJj'};
const scene=buildFallbackScenes('Nồi cơm','','')[0];
type Props=React.ComponentProps<typeof ProductScriptStudio>;
function Harness({voice= {...asset, type:'audio',mimeType:'audio/mpeg',mediaId:'voice-id'} as MediaAsset, longDialogue=false}) {
  const [scenes,setScenes]=useState<SceneCard[]>([{...scene, dialogue:longDialogue ? 'một '.repeat(40) : 'Đây là nồi cơm.',generatedImage:asset}]);
  const [settings,setSettings]=useState<Props['reviewSettings']>({productAppearance:'vỏ đen',costumeAppearance:'áo trắng',selectedVoiceRegion:'north_hanoi',selectedVoiceGender:'male',customVoiceNotes:'Read gently'});
  const props:Props={reviewSettings:settings,onReviewSettingsChange:setSettings,productAsset:asset,modelPersonAsset:asset,costumeAsset:null,backgroundAsset:asset,audioVoiceAsset:voice,
    onSelectProduct:vi.fn(),onClearProduct:vi.fn(),onSelectModelPerson:vi.fn(),onClearModelPerson:vi.fn(),onSelectCostume:vi.fn(),onClearCostume:vi.fn(),onSelectBackground:vi.fn(),onClearBackground:vi.fn(),onSelectAudioVoice:vi.fn(),onClearAudioVoice:vi.fn(),
    productName:'Nồi cơm',productDescription:'dung tích 1L',targetAudience:'Gia đình',selectedStyle:'tiktok_ugc',selectedVoiceTone:'warm_natural',
    onProductNameChange:vi.fn(),onProductDescriptionChange:vi.fn(),onTargetAudienceChange:vi.fn(),onStyleChange:vi.fn(),onVoiceToneChange:vi.fn(),scenes,onUpdateScenes:setScenes,
    history:[],onAddHistory:vi.fn(),onClearHistory:vi.fn(),selectedImageModel:'image-model',selectedVideoModel:'video-model',onImageModelChange:vi.fn(),onVideoModelChange:vi.fn(),aspectRatio:'16:9',onAspectRatioChange:vi.fn(),resolution:'720p',onResolutionChange:vi.fn(),onExportJSON:vi.fn(),onImportJSON:vi.fn()};
  return <ProductScriptStudio {...props}/>;
}
beforeEach(()=>{vi.resetAllMocks();vi.spyOn(console,'warn').mockImplementation(()=>{});});
afterEach(cleanup);

describe('review rendering integration',()=>{
  it('sends voice, custom voice direction and actual product information to Flow',async()=>{
    vi.mocked(Flow.generate.video).mockResolvedValue({...asset,type:'video',mimeType:'video/mp4'});
    render(<Harness/>);
    fireEvent.click(screen.getByText('render-1'));
    await waitFor(()=>expect(Flow.generate.video).toHaveBeenCalledTimes(1));
    const call=vi.mocked(Flow.generate.video).mock.calls[0][0];
    expect(call.audioReferenceMediaIds).toEqual(['voice-id']);
    expect(call.prompt).toContain('Nồi cơm');
    expect(call.prompt).toContain('Read gently');
    expect(call.prompt).not.toMatch(/cosmetic bottle|skincare/i);
    expect(call.aspectRatio).toBe('16:9');
  });
  it('shows voice errors without issuing an automatic request without voice',async()=>{
    vi.mocked(Flow.generate.video).mockRejectedValue(new Error('Audio not supported'));
    render(<Harness/>);
    fireEvent.click(screen.getByText('render-1'));
    await screen.findByText('Audio not supported');
    expect(Flow.generate.video).toHaveBeenCalledTimes(1);
  });
  it('blocks legacy local voice and speech longer than the selected duration',async()=>{
    const {unmount}=render(<Harness voice={{...asset,type:'audio',mediaId:'upload_123'}}/>);
    fireEvent.click(screen.getByText('render-1'));
    await screen.findByText(/Giọng tham chiếu chưa được tải lên/);
    expect(Flow.generate.video).not.toHaveBeenCalled();
    unmount();render(<Harness longDialogue/>);
    fireEvent.click(screen.getByText('render-1'));
    await screen.findByText(/Lời thoại quá dài/);
    expect(Flow.generate.video).not.toHaveBeenCalled();
  });
  it('prevents duplicate requests for the same scene',async()=>{
    let complete!: (value: typeof asset) => void;
    vi.mocked(Flow.generate.image).mockImplementation(()=>new Promise(resolve=>{complete=resolve;}));
    render(<Harness/>);
    fireEvent.click(screen.getByText('image-1'));fireEvent.click(screen.getByText('render-1'));
    expect(Flow.generate.image).toHaveBeenCalledTimes(1);
    expect(Flow.generate.video).not.toHaveBeenCalled();
    complete(asset);
    await waitFor(()=>expect(screen.getByText('image-1')).toBeTruthy());
  });
});

describe('modal hook lifecycle',()=>{
  for(const Component of [SceneDetailModal,RegenerateFeedbackModal,RegenerateImageModal]) {
    it(`opens and closes ${Component.name} without changing hook order`,()=>{
      const props={scene:null,isOpen:false,onClose:vi.fn(),onSave:vi.fn(),onSubmit:vi.fn()};
      const {rerender}=render(<Component {...props}/>);
      rerender(<Component {...props} scene={scene} isOpen/>);
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
      rerender(<Component {...props}/>);
    });
  }
});
