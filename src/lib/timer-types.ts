export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type DisplayStyle = 'classic' | 'minimal' | 'progress';

export interface TimerTask {
  id: string;
  name: string;
  duration: number; // total seconds
  remaining: number; // remaining milliseconds (precise)
  status: TimerStatus;
  startedAt: number | null; // timestamp when started/resumed
  pausedRemaining: number | null; // remaining ms when paused
}

export interface TimerState {
  tasks: TimerTask[];
  activeTaskId: string | null;
  displayStyle: DisplayStyle;
  soundEnabled: boolean;
  warnAtPercent: number; // warn when remaining < this % of duration
}

export function createTask(name: string, durationSeconds: number): TimerTask {
  return {
    id: crypto.randomUUID(),
    name,
    duration: durationSeconds,
    remaining: durationSeconds * 1000,
    status: 'idle',
    startedAt: null,
    pausedRemaining: null,
  };
}

export function formatTime(ms: number): { minutes: string; seconds: string; centiseconds: string } {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    centiseconds: String(Math.max(0, centiseconds)).padStart(2, '0'),
  };
}

export function getTimeColor(remaining: number, duration: number): string {
  const ratio = duration > 0 ? remaining / (duration * 1000) : 1;
  if (ratio > 0.2) return '#22c55e'; // green
  if (ratio > 0.1) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function getTimeColorClass(remaining: number, duration: number): string {
  const ratio = duration > 0 ? remaining / (duration * 1000) : 1;
  if (ratio > 0.2) return 'text-green-400';
  if (ratio > 0.1) return 'text-amber-400';
  return 'text-red-400';
}

export function shouldPulse(remaining: number, duration: number): boolean {
  const ratio = duration > 0 ? remaining / (duration * 1000) : 1;
  return ratio <= 0.1 && ratio > 0;
}

export function isOvertime(remaining: number): boolean {
  return remaining <= 0;
}
