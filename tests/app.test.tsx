import 'fake-indexeddb/auto';
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Flow } from 'flow-sdk';
import App from '../App';
import { saveProject } from '../services/projectStorage';
import { buildFallbackScenes } from '../utils/productPrompts';
afterEach(cleanup);

it('restores a saved project before editing and exports its settings and media',async()=>{
  await saveProject({productName:'Máy lọc không khí',voiceRegion:'north_hanoi',voiceGender:'male',aspectRatio:'16:9',customVoiceNotes:'Giọng trầm',scenes:buildFallbackScenes('Máy lọc không khí','',''),productAsset:{mediaId:'product',type:'image',mimeType:'image/png',base64:'YWJj',name:'product'}});
  vi.mocked(Flow.download).mockResolvedValue(undefined);
  render(<App/>);
  await waitFor(()=>expect(screen.queryByText('Đang khôi phục dự án...')).toBeNull());
  fireEvent.click(screen.getByTitle('Xuất file JSON dự án'));
  await waitFor(()=>expect(Flow.download).toHaveBeenCalled());
  const download=vi.mocked(Flow.download).mock.calls.at(-1)![0];
  const project=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(download.base64),c=>c.charCodeAt(0))));
  expect(project).toMatchObject({productName:'Máy lọc không khí',voiceRegion:'north_hanoi',voiceGender:'male',aspectRatio:'16:9',customVoiceNotes:'Giọng trầm'});
  expect(project.productAsset.base64).toBe('YWJj');
});
