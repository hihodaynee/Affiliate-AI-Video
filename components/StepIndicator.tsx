import React from 'react';
import { StepKey } from '../types';

interface StepIndicatorProps {
  activeStep: StepKey;
  onSelectStep: (step: StepKey) => void;
  hasStep1Result: boolean;
  hasStep2Result: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  activeStep,
  onSelectStep,
  hasStep1Result,
  hasStep2Result
}) => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 my-2">
      <button
        onClick={() => onSelectStep('step1_character')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
          activeStep === 'step1_character'
            ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700/60'
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-zinc-950/20 flex items-center justify-center text-[10px] font-bold">
          {hasStep1Result ? '✓' : '•'}
        </span>
        <span>Thay Đồ Nhân Vật</span>
      </button>

      <span className="material-symbols-outlined text-zinc-600 text-sm">arrow_forward_ios</span>

      <button
        onClick={() => onSelectStep('step2_motion')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
          activeStep === 'step2_motion'
            ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700/60'
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-zinc-950/20 flex items-center justify-center text-[10px] font-bold">
          {hasStep2Result ? '✓' : '•'}
        </span>
        <span>Sao Chép Chuyển Động Video</span>
      </button>
    </div>
  );
};