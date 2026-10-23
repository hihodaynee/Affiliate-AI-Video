import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { VideoConcatenatorTimeline } from '../components/VideoConcatenatorTimeline';
import { asmrTimelineScenes } from '../services/asmrGeneration';
import { asmrProject, asmrVideo } from './asmrFixtures';

const ffmpeg=vi.hoisted(()=>({load:vi.fn(),writeFile:vi.fn(),exec:vi.fn(),readFile:vi.fn(),deleteFile:vi.fn(),dispose:vi.fn()}));
vi.mock('../services/ffmpegService',()=>({FFmpegService:class {
  load=ffmpeg.load; writeFile=ffmpeg.writeFile; exec=ffmpeg.exec;
  readFile=ffmpeg.readFile; deleteFile=ffmpeg.deleteFile; dispose=ffmpeg.dispose;
}}));
beforeEach(()=>{
  vi.resetAllMocks();
  ffmpeg.load.mockResolvedValue(undefined); ffmpeg.writeFile.mockResolvedValue(undefined);
  ffmpeg.exec.mockResolvedValue(undefined); ffmpeg.readFile.mockResolvedValue(new Uint8Array([1,2,3]));
  ffmpeg.deleteFile.mockResolvedValue(undefined);
  vi.spyOn(console,'error').mockImplementation(()=>{});
});
afterEach(cleanup);

function renderTimeline(asmr=true) {
  const project=asmrProject(true);
  project.scenes=project.scenes.map(scene=>({...scene,video:asmrVideo,status:'done',audioReview:'approved'}));
  const saved=vi.fn();
  render(<VideoConcatenatorTimeline scenes={asmrTimelineScenes(project)} aspectRatio="9:16" isOpen
    requireAudio={asmr} preserveOrder={asmr} onClose={vi.fn()} onSaveMergedVideo={saved}/>);
  return saved;
}

it('preserves audio and the planned narration order when merging ASMR scenes',async()=>{
  const saved=renderTimeline();
  expect(screen.queryByRole('button',{name:/Không tiếng/})).toBeNull();
  for(const button of screen.getAllByTitle('Chuyển ra sau')) expect((button as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:/Ghép Nối 2 Clip/}));
  await waitFor(()=>expect(saved).toHaveBeenCalledTimes(1));
  const args=ffmpeg.exec.mock.calls[0][0] as string[];
  expect(args).toContain('[outa]'); expect(args).not.toContain('-an');
  expect(args.join(' ')).toContain('concat=n=2:v=1:a=1');
  expect(saved.mock.calls[0][0]).toMatchObject({type:'video',base64:'AQID'});
});

it('shows missing-audio failure and never falls back to a silent ASMR export',async()=>{
  ffmpeg.exec.mockRejectedValue(new Error('Missing audio stream'));
  const saved=renderTimeline();
  fireEvent.click(screen.getByRole('button',{name:/Ghép Nối 2 Clip/}));
  await screen.findByText(/ASMR cần âm thanh/);
  expect(ffmpeg.exec).toHaveBeenCalledTimes(1);
  expect(ffmpeg.readFile).not.toHaveBeenCalled(); expect(saved).not.toHaveBeenCalled();
  expect(screen.queryByRole('button',{name:/Không tiếng/})).toBeNull();
});

it('keeps reordering and the explicit silent option available for the existing review',()=>{
  renderTimeline(false);
  expect((screen.getAllByTitle('Chuyển ra sau')[0] as HTMLButtonElement).disabled).toBe(false);
  expect(screen.getByRole('button',{name:/Không tiếng/})).toBeTruthy();
});
