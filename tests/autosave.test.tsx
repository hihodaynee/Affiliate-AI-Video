import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useProjectAutosave } from '../hooks/useProjectAutosave';
import { loadProject, saveProject } from '../services/projectStorage';
vi.mock('../services/projectStorage',()=>({loadProject:vi.fn(),saveProject:vi.fn()}));
beforeEach(()=>{vi.resetAllMocks();vi.mocked(saveProject).mockResolvedValue();});
afterEach(()=>{cleanup();vi.useRealTimers();});

it('does not overwrite an unreadable autosave with an empty draft',async()=>{
  vi.mocked(loadProject).mockRejectedValue(new Error('Corrupt database'));
  const {result}=renderHook(()=>useProjectAutosave({},vi.fn()));
  await waitFor(()=>expect(result.current.loading).toBe(false));
  vi.useFakeTimers();
  await act(async()=>{await vi.advanceTimersByTimeAsync(2000);});
  expect(saveProject).not.toHaveBeenCalled();
  expect(result.current.message).toContain('Không thể khôi phục');
});

it('saves the latest draft after restoration without writing on every keystroke',async()=>{
  vi.mocked(loadProject).mockResolvedValue(null);
  const initial={name:'first'};
  const {result,rerender}=renderHook(({project})=>useProjectAutosave(project,vi.fn()),{initialProps:{project:initial}});
  await waitFor(()=>expect(result.current.loading).toBe(false));
  vi.useFakeTimers();
  rerender({project:{name:'second'}});
  rerender({project:{name:'latest'}});
  await act(async()=>{await vi.advanceTimersByTimeAsync(1000);});
  expect(saveProject).toHaveBeenCalledTimes(1);
  expect(saveProject).toHaveBeenCalledWith({name:'latest'});
});
