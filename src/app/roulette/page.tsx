'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RouletteWheel from '@/components/RouletteWheel';
import { getHardcodedPool } from '@/lib/fallbackPool';
import { RouletteResult, Exercise } from '@/types';

const pool = getHardcodedPool();
let exerciseCounter = 0;

export default function RoulettePage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<RouletteResult | null>(null);
  const [isActive, setIsActive] = useState(false);

  const handleSpin = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleComplete = useCallback(
    (result: RouletteResult) => {
      setChallenge(result);
      setIsActive(true);
    },
    []
  );

  const handleStartTake = useCallback(() => {
    if (!challenge) return;

    const exercise: Exercise = {
      id: `ex_${++exerciseCounter}_${Date.now()}`,
      line: challenge.line,
      emotion: challenge.emotion,
      attempt: 1,
    };

    sessionStorage.setItem('currentExercise', JSON.stringify(exercise));
    router.push('/record');
  }, [challenge, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-white via-white to-stage-light">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-display text-gray-900">🎰 Scene Roulette</h1>
        <p className="text-crimson text-xs font-semibold uppercase tracking-[0.15em] mt-1">
          {challenge ? '✅ Challenge Ready' : '👉 Spin for your scene'}
        </p>
      </div>

      <RouletteWheel
        lines={pool.lines}
        emotions={pool.emotions}
        onSpin={handleSpin}
        onComplete={handleComplete}
        disabled={false}
      />

      {isActive && challenge && (
        <button
          onClick={handleStartTake}
          className="mt-8 px-10 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-electric to-crimson text-white shadow-lg shadow-crimson/20 hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
        >
          🎬 Start take
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}
