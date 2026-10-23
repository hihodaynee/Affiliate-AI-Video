import type { MediaAsset } from '../types';
import { createAsmrProject, type AsmrProject, type AsmrScene } from '../types/asmr';
import { asmrInputKey } from '../services/asmrGeneration';

export const asmrImage: MediaAsset = {mediaId:'product-photo',type:'image',mimeType:'image/png',name:'Sản phẩm',base64:'YWJj',previewUrl:'data:image/png;base64,YWJj'};
export const asmrVideo: MediaAsset = {...asmrImage,mediaId:'video-result',type:'video',mimeType:'video/mp4',previewUrl:'data:video/mp4;base64,YWJj'};
export function asmrScene(id: string, durationSeconds: AsmrScene['durationSeconds'] = 4, voice = false): AsmrScene {
  return {id,title:`Cận chi tiết ${id}`,purpose:'Quan sát ngoại hình thật',durationSeconds,audioMode:voice?'voiceover':'asmr',narration:voice?'Bề mặt có màu đen.':'',
    beats:[{start:0,end:durationSeconds,action:'Tay chạm nhẹ bề mặt.',camera:'Cận cảnh 45 độ.',sound:'Tiếng tiếp xúc nhẹ.'}],status:'idle',video:null,audioReview:'pending'};
}
export function asmrProject(alternating = false): AsmrProject {
  const project: AsmrProject = {...createAsmrProject(),product:asmrImage,productName:'Giá đỡ',
    narrationMode:alternating?'alternating':'none',description:'Mặt trên màu đen.',creativeReasoning:'Dùng cận cảnh để thấy chi tiết, dành đủ thời gian cho tiếng tiếp xúc.',
    scenes:[asmrScene('one',4,alternating),asmrScene('two',6)]};
  return {...project,planInputKey:asmrInputKey(project)};
}
