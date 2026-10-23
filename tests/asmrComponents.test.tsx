import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Flow } from 'flow-sdk';
import { AsmrReviewStudio } from '../components/AsmrReviewStudio';
import { loadAsmrProject, saveAsmrProject } from '../services/asmrStorage';
import { createAsmrProject } from '../types/asmr';
import { asmrImage, asmrProject, asmrVideo } from './asmrFixtures';

vi.mock('../services/asmrStorage', async importOriginal => ({...await importOriginal<typeof import('../services/asmrStorage')>(),loadAsmrProject:vi.fn(),saveAsmrProject:vi.fn()}));
beforeEach(()=>{vi.resetAllMocks();vi.mocked(loadAsmrProject).mockResolvedValue(asmrProject());vi.mocked(saveAsmrProject).mockResolvedValue();});
afterEach(()=>{cleanup();vi.useRealTimers();});

it('starts with one image only and allows optional narration without any required KOC or background', async()=>{
  vi.mocked(loadAsmrProject).mockResolvedValue({...createAsmrProject(),product:asmrImage});
  const plan=asmrProject(true);
  vi.mocked(Flow.generate.text).mockResolvedValue({text:JSON.stringify(plan)});
  render(<AsmrReviewStudio/>);
  await screen.findByText('AI phân tích & viết kịch bản');
  fireEvent.click(screen.getByLabelText('Có giọng review xen kẽ'));
  fireEvent.click(screen.getByText('AI phân tích & viết kịch bản'));
  await screen.findByText('Kịch bản AI · 2 cảnh · 10 giây');
  expect(vi.mocked(Flow.generate.text).mock.calls[0][0]).toContain('ALTERNATING REVIEW');
  expect(screen.getByLabelText('Lời review cảnh 1')).toBeTruthy();
  expect(Flow.generate.video).not.toHaveBeenCalled();
});

it('locks duplicate requests and stops a batch on failure, keeping completed clips', async()=>{
  let finish!: (asset: typeof asmrVideo)=>void;
  vi.mocked(Flow.generate.video).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockRejectedValueOnce(new Error('Hết quota'));
  render(<AsmrReviewStudio/>);
  await screen.findByText('Tạo các cảnh chưa đạt');
  fireEvent.click(screen.getByText('Tạo các cảnh chưa đạt'));
  fireEvent.click(screen.getByText('Tạo các cảnh chưa đạt'));
  expect(Flow.generate.video).toHaveBeenCalledTimes(1);
  await act(async()=>{finish(asmrVideo);});
  await waitFor(()=>expect(screen.getAllByText('Hết quota').length).toBeGreaterThan(0));
  expect(Flow.generate.video).toHaveBeenCalledTimes(2);
  expect(screen.getByText('Tải clip 1')).toBeTruthy();
  expect(screen.queryByText('Tải clip 2')).toBeNull();
  expect((screen.getByText('Ghép video ASMR (0/2 đã nghe)') as HTMLButtonElement).disabled).toBe(true);
});

it('pauses after the current clip without cancelling it or creating later clips',async()=>{
  let finish!: (asset: typeof asmrVideo)=>void;
  vi.mocked(Flow.generate.video).mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
  render(<AsmrReviewStudio/>); await screen.findByText('Tạo các cảnh chưa đạt');
  fireEvent.click(screen.getByText('Tạo các cảnh chưa đạt'));
  fireEvent.click(screen.getByText('Dừng sau cảnh hiện tại'));
  await act(async()=>{finish(asmrVideo);});
  expect(Flow.generate.video).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Tải clip 1')).toBeTruthy();
});

it('requires sound review before merge and invalidates the plan when input changes',async()=>{
  const project=asmrProject(); project.scenes=project.scenes.map(scene=>({...scene,video:asmrVideo,status:'done'}));
  vi.mocked(loadAsmrProject).mockResolvedValue(project);
  render(<AsmrReviewStudio/>); await screen.findByText('Ghép video ASMR (0/2 đã nghe)');
  for(const index of [1,2]) fireEvent.click(screen.getByLabelText(`Đã nghe: âm thanh cảnh ${index} phù hợp`));
  expect((screen.getByText('Ghép video ASMR (2/2 đã nghe)') as HTMLButtonElement).disabled).toBe(false);
  fireEvent.change(screen.getByLabelText('Tên sản phẩm'),{target:{value:'Sản phẩm khác'}});
  expect((screen.getByText('Tạo lại clip 1') as HTMLButtonElement).disabled).toBe(true);
  expect((screen.getByText('Ghép video ASMR (2/2 đã nghe)') as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText('Tải clip 1')).toBeTruthy();
});

it('does not overwrite an unreadable ASMR autosave',async()=>{
  vi.mocked(loadAsmrProject).mockRejectedValue(new Error('Corrupt data'));
  render(<AsmrReviewStudio/>); await screen.findByText('AI phân tích & viết kịch bản');
  vi.useFakeTimers();
  fireEvent.change(screen.getByLabelText('Tên sản phẩm'),{target:{value:'New draft'}});
  await act(async()=>{await vi.advanceTimersByTimeAsync(2000);});
  expect(saveAsmrProject).not.toHaveBeenCalled();
});
