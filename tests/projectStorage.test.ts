import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { buildFallbackScenes } from '../utils/productPrompts';
import { loadProject, parseProject, saveProject, serializeProject } from '../services/projectStorage';

describe('project backup and restore', () => {
  it('round trips settings, inputs and generated media through IndexedDB', async () => {
    const video = {mediaId:'generated',base64:'YWJj',mimeType:'video/mp4',type:'video',name:'scene.mp4',previewUrl:'blob:expired'};
    const project = {
      version:1, productName:'Nồi cơm', productDescription:'Dung tích 1L', targetAudience:'Gia đình',
      selectedStyle:'luxury_commercial',selectedVoiceTone:'warm_natural',voiceRegion:'north_hanoi',voiceGender:'male',customVoiceNotes:'Chậm rãi',
      aspectRatio:'16:9',resolution:'360p',imageModel:'custom image',videoModel:'custom video',productAppearance:'màu đen',costumeAppearance:'áo xanh',
      audioVoiceAsset:{...video,mediaId:'voice',type:'audio',mimeType:'audio/wav'},
      scenes:buildFallbackScenes('Nồi cơm','','').map((scene,i)=>({...scene,status:i===0?'generating_video':'done',generatedVideo:video})),
    };
    await saveProject(project);
    const restored = await loadProject();
    expect(restored).toMatchObject({productName:'Nồi cơm',voiceRegion:'north_hanoi',voiceGender:'male',aspectRatio:'16:9',customVoiceNotes:'Chậm rãi'});
    expect(restored?.audioVoiceAsset?.mediaId).toBe('voice');
    expect(restored?.scenes[0].status).toBe('idle');
    expect(restored?.scenes[0].generatedVideo?.previewUrl).toBe('data:video/mp4;base64,YWJj');
    expect(serializeProject(project)).not.toContain('blob:expired');
  });
  it('rejects invalid imported scenes before applying any state', () => {
    const scenes=buildFallbackScenes('Áo khoác','','');
    expect(()=>parseProject({scenes:[{...scenes[0],durationSeconds:999}]})).toThrow();
    expect(()=>parseProject({scenes:[scenes[0],scenes[0]]})).toThrow();
    expect(()=>parseProject({version:999,scenes})).toThrow();
  });
  it('accepts the original export format without requiring new settings', () => {
    const imported = parseProject({productName:'Legacy',scenes:buildFallbackScenes('Legacy','','')});
    expect(imported.voiceRegion).toBe('south_hcm');
    expect(imported.productAsset).toBeNull();
    expect(imported.version).toBe(1);
  });
});
