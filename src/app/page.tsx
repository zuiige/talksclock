'use client';

import dynamic from 'next/dynamic';

// Skip SSR entirely — the timer is a fully interactive client-side tool
// that uses crypto.randomUUID(), Date.now(), window.innerWidth, Web Audio API, etc.
// This eliminates all hydration mismatch issues.
const TimerPageContent = dynamic(
  () => import('@/components/timer/timer-page-content'),
  { ssr: false }
);

export default function TimerPage() {
  return <TimerPageContent />;
}
