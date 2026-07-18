'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/roulette');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stage-dark">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-display text-gold mb-2">🦵 brAIk-a-leg</h1>
        <p className="text-crimson-light text-sm uppercase tracking-[0.2em]">Scene Roulette</p>
        <p className="text-white/30 text-xs mt-4">Loading...</p>
      </div>
    </div>
  );
}
