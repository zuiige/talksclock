'use client';

import { Button } from '@/components/ui/button';
import type { TimerStatus } from '@/lib/timer-types';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface ControlPanelProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip?: () => void;
  hasMultipleTasks?: boolean;
}

export function ControlPanel({ status, onStart, onPause, onReset, onSkip, hasMultipleTasks }: ControlPanelProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Reset button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="h-12 w-12 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
        title="重置"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      {/* Play / Pause button */}
      {status === 'running' ? (
        <Button
          onClick={onPause}
          className="h-16 w-16 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-105 active:scale-95"
          title="暂停"
        >
          <Pause className="h-7 w-7" />
        </Button>
      ) : (
        <Button
          onClick={onStart}
          className="h-16 w-16 rounded-full bg-green-500/80 hover:bg-green-500 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
          title={status === 'completed' ? '重新开始' : '开始'}
        >
          <Play className="h-7 w-7 ml-0.5" />
        </Button>
      )}

      {/* Skip button (when multiple tasks) */}
      {hasMultipleTasks && onSkip && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkip}
          className="h-12 w-12 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
          title="跳到下一环节"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
