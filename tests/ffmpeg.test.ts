import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FFmpegService } from '../services/ffmpegService';
import { buildConcatArgs } from '../utils/concat';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage?: (event: {data:unknown}) => void;
  onerror?: () => void;
  onmessageerror?: () => void;
  exitCode = 0;
  terminate = vi.fn();
  constructor() { FakeWorker.instances.push(this); }
  postMessage(message: {id:number;type:string}) {
    queueMicrotask(() => this.onmessage?.({data:{id:message.id,type:message.type,data:message.type==='EXEC'?this.exitCode:true}}));
  }
}
let service: FFmpegService;
beforeEach(() => {
  FakeWorker.instances=[];
  vi.stubGlobal('Worker',FakeWorker);
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)})));
  vi.stubGlobal('URL', {createObjectURL:vi.fn(()=> 'blob:worker'),revokeObjectURL:vi.fn()});
  service=new FFmpegService();
});
afterEach(()=>{service.dispose();vi.unstubAllGlobals();vi.useRealTimers();});

describe('FFmpeg failures and resources', () => {
  it('rejects failed core downloads and does not create a worker', async () => {
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:false,status:503})));
    await expect(service.load()).rejects.toThrow('HTTP 503');
    expect(FakeWorker.instances).toHaveLength(0);
  });
  it('shares initialization and rejects nonzero FFmpeg exit codes', async () => {
    await Promise.all([service.load(),service.load()]);
    expect(FakeWorker.instances).toHaveLength(1);
    FakeWorker.instances[0].exitCode=1;
    await expect(service.exec(['-i','no-audio.mp4'])).rejects.toThrow('mã lỗi 1');
  });
  it('rejects pending requests when the worker crashes, then permits reload', async () => {
    await service.load();
    FakeWorker.instances[0].postMessage=()=>{};
    const operation=service.exec([]);
    const assertion=expect(operation).rejects.toThrow('worker bị lỗi');
    FakeWorker.instances[0].onerror?.();
    await assertion;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
    await service.load();
    expect(FakeWorker.instances).toHaveLength(2);
  });
  it('terminates a stalled worker after the processing deadline', async () => {
    await service.load();
    vi.useFakeTimers();
    FakeWorker.instances[0].postMessage=()=>{};
    const operation=service.exec([]);
    const assertion=expect(operation).rejects.toThrow('hết thời gian');
    await vi.advanceTimersByTimeAsync(185_000);
    await assertion;
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalled();
  });
  it('keeps landscape output and resets timestamps before concatenation', () => {
    const args=buildConcatArgs(['one.mp4','two.mp4'],'16:9',true);
    expect(args.join(' ')).toContain('scale=1280:720');
    expect(args.join(' ')).toContain('setpts=PTS-STARTPTS');
    expect(args.join(' ')).toContain('asetpts=PTS-STARTPTS');
    expect(args).toContain('[outa]');
    const silent=buildConcatArgs(['one.mp4'],'9:16',false);
    expect(silent.join(' ')).toContain('scale=720:1280');
    expect(silent).toContain('-an');
    expect(silent.join(' ')).not.toContain('[0:a]');
  });
});
