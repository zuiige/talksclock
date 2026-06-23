'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimerTask, TimerStatus } from '@/lib/timer-types';

interface UseCountdownOptions {
  onWarn?: () => void;
  onComplete?: () => void;
  warnAtMs?: number;
}

interface UseCountdownReturn {
  remaining: number;
  status: TimerStatus;
  progress: number; // 0-1, 1 = full time remaining
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: number; // incrementing counter to force re-renders
}

export function useCountdown(
  task: TimerTask,
  onUpdate: (id: string, updates: Partial<TimerTask>) => void,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const { onWarn, onComplete, warnAtMs = 60000 } = options;
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  const warnedRef = useRef(false);
  const completedRef = useRef(false);

  const computeRemaining = useCallback((): number => {
    if (task.status === 'idle') {
      return task.duration * 1000;
    }
    if (task.status === 'paused') {
      return task.pausedRemaining ?? task.duration * 1000;
    }
    if (task.status === 'completed') {
      return 0;
    }
    // running
    if (task.startedAt !== null) {
      const elapsed = Date.now() - task.startedAt;
      const base = task.pausedRemaining ?? task.duration * 1000;
      return Math.max(0, base - elapsed);
    }
    return task.duration * 1000;
  }, [task]);

  const remaining = computeRemaining();
  const progress = task.duration > 0 ? remaining / (task.duration * 1000) : 0;

  // Animation loop for running timers
  useEffect(() => {
    if (task.status !== 'running') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const animate = () => {
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [task.status, task.id]);

  // Check for warn and complete
  useEffect(() => {
    if (task.status !== 'running') return;

    if (remaining <= warnAtMs && remaining > 0 && !warnedRef.current) {
      warnedRef.current = true;
      onWarn?.();
    }

    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onUpdate(task.id, {
        status: 'completed',
        remaining: 0,
        startedAt: null,
        pausedRemaining: null,
      });
      onComplete?.();
    }
  }, [remaining, task.status, task.id, warnAtMs, onWarn, onComplete, onUpdate]);

  // Reset refs when task changes
  useEffect(() => {
    warnedRef.current = false;
    completedRef.current = false;
  }, [task.id]);

  const start = useCallback(() => {
    if (task.status === 'running') return;

    const now = Date.now();
    let pausedRemaining: number;

    if (task.status === 'paused' && task.pausedRemaining !== null) {
      pausedRemaining = task.pausedRemaining;
    } else if (task.status === 'completed') {
      pausedRemaining = task.duration * 1000;
    } else {
      pausedRemaining = task.duration * 1000;
    }

    onUpdate(task.id, {
      status: 'running',
      startedAt: now,
      pausedRemaining: pausedRemaining,
      remaining: pausedRemaining,
    });
  }, [task, onUpdate]);

  const pause = useCallback(() => {
    if (task.status !== 'running') return;

    const currentRemaining = computeRemaining();
    onUpdate(task.id, {
      status: 'paused',
      startedAt: null,
      pausedRemaining: currentRemaining,
      remaining: currentRemaining,
    });
  }, [task, onUpdate, computeRemaining]);

  const reset = useCallback(() => {
    onUpdate(task.id, {
      status: 'idle',
      startedAt: null,
      pausedRemaining: null,
      remaining: task.duration * 1000,
    });
    warnedRef.current = false;
    completedRef.current = false;
  }, [task, onUpdate]);

  return {
    remaining,
    status: task.status,
    progress,
    start,
    pause,
    reset,
    tick,
  };
}
