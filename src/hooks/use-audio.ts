'use client';

import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContext();
      } catch {
        return null;
      }
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(
    (frequency = 880, duration = 200, volume = 0.3) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    },
    [getAudioContext]
  );

  const playWarnSound = useCallback(() => {
    // Two quick beeps for warning
    playBeep(660, 150, 0.2);
    setTimeout(() => playBeep(660, 150, 0.2), 200);
  }, [playBeep]);

  const playCompleteSound = useCallback(() => {
    // Three ascending beeps for completion
    playBeep(523, 200, 0.3);
    setTimeout(() => playBeep(659, 200, 0.3), 250);
    setTimeout(() => playBeep(784, 400, 0.3), 500);
  }, [playBeep]);

  const playTickSound = useCallback(() => {
    playBeep(440, 50, 0.1);
  }, [playBeep]);

  return { playBeep, playWarnSound, playCompleteSound, playTickSound };
}
