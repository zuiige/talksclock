'use client';

import { formatTime, getTimeColor, shouldPulse, isOvertime } from '@/lib/timer-types';
import type { DisplayStyle } from '@/lib/timer-types';

interface CountdownDisplayProps {
  remaining: number;
  duration: number;
  displayStyle: DisplayStyle;
  taskName: string;
}

function RingProgress({ progress, color, size = 280, className }: { progress: number; color: string; size?: number; className?: string }) {
  const strokeWidth = size * 0.04;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-300 ease-linear"
        style={{
          filter: `drop-shadow(0 0 8px ${color}66)`,
        }}
      />
    </svg>
  );
}

function ClassicDisplay({ remaining, duration, taskName }: Omit<CountdownDisplayProps, 'displayStyle'>) {
  const color = getTimeColor(remaining, duration);
  const pulse = shouldPulse(remaining, duration);
  const overtime = isOvertime(remaining);
  const { minutes, seconds, centiseconds } = formatTime(remaining);
  const progress = duration > 0 ? remaining / (duration * 1000) : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
      <div className="text-xs md:text-sm font-medium tracking-widest uppercase text-white/40">{taskName}</div>
      <div className="relative flex items-center justify-center w-[220px] h-[220px] md:w-[300px] md:h-[300px]">
        <RingProgress progress={progress} color={color} size={300} className="w-full h-full transform -rotate-90" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`font-mono font-bold tabular-nums tracking-tight ${overtime ? 'animate-pulse text-red-500' : ''} ${pulse ? 'animate-gentle-pulse' : ''}`}
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              color: overtime ? '#ef4444' : color,
              textShadow: overtime
                ? '0 0 20px rgba(239,68,68,0.5), 0 0 40px rgba(239,68,68,0.3)'
                : `0 0 20px ${color}33`,
            }}
          >
            {minutes}:{seconds}
          </div>
          <div className="font-mono text-sm md:text-lg tabular-nums text-white/30">{centiseconds}</div>
        </div>
      </div>
    </div>
  );
}

function MinimalDisplay({ remaining, duration, taskName }: Omit<CountdownDisplayProps, 'displayStyle'>) {
  const color = getTimeColor(remaining, duration);
  const pulse = shouldPulse(remaining, duration);
  const overtime = isOvertime(remaining);
  const { minutes, seconds } = formatTime(remaining);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="text-base font-medium tracking-widest uppercase text-white/30">{taskName}</div>
      <div
        className={`font-mono font-bold tabular-nums tracking-tighter ${overtime ? 'animate-pulse' : ''} ${pulse ? 'animate-gentle-pulse' : ''}`}
        style={{
          fontSize: 'clamp(4rem, 18vw, 14rem)',
          color: overtime ? '#ef4444' : color,
          textShadow: overtime
            ? '0 0 30px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.4)'
            : `0 0 30px ${color}44`,
          lineHeight: 1,
        }}
      >
        {minutes}:{seconds}
      </div>
    </div>
  );
}

function ProgressDisplay({ remaining, duration, taskName }: Omit<CountdownDisplayProps, 'displayStyle'>) {
  const color = getTimeColor(remaining, duration);
  const pulse = shouldPulse(remaining, duration);
  const overtime = isOvertime(remaining);
  const progress = duration > 0 ? remaining / (duration * 1000) : 0;
  const { minutes, seconds, centiseconds } = formatTime(remaining);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-6">
      <div className="text-sm font-medium tracking-widest uppercase text-white/40">{taskName}</div>
      <div
        className={`font-mono font-bold tabular-nums tracking-tight ${overtime ? 'animate-pulse text-red-500' : ''} ${pulse ? 'animate-gentle-pulse' : ''}`}
        style={{
          fontSize: 'clamp(3rem, 10vw, 5rem)',
          color: overtime ? '#ef4444' : color,
          textShadow: overtime
            ? '0 0 20px rgba(239,68,68,0.5)'
            : `0 0 15px ${color}33`,
        }}
      >
        {minutes}:{seconds}
        <span className="text-2xl text-white/30">.{centiseconds}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-300 ease-linear"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: overtime ? '#ef4444' : color,
              boxShadow: overtime
                ? '0 0 12px rgba(239,68,68,0.5)'
                : `0 0 12px ${color}66`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/30 font-mono tabular-nums">
          <span>{minutes}:{seconds} 剩余</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export function CountdownDisplay({ remaining, duration, displayStyle, taskName }: CountdownDisplayProps) {
  switch (displayStyle) {
    case 'classic':
      return <ClassicDisplay remaining={remaining} duration={duration} taskName={taskName} />;
    case 'minimal':
      return <MinimalDisplay remaining={remaining} duration={duration} taskName={taskName} />;
    case 'progress':
      return <ProgressDisplay remaining={remaining} duration={duration} taskName={taskName} />;
    default:
      return <ClassicDisplay remaining={remaining} duration={duration} taskName={taskName} />;
  }
}
