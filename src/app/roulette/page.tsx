'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ScenePool, RouletteResult } from '@/types';

export default function RoulettePage() {
  const router = useRouter();
  const [pool, setPool] = useState<ScenePool | null>(null);
  const [challenge, setChallenge] = useState<RouletteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchPool();
  }, []);

  const fetchPool = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pool');
      const data = await res.json();
      if (data.success) {
        setPool(data.data);
      } else {
        setError(data.error || 'Failed to load scene pool');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleComplete = useCallback((result: RouletteResult) => {
    setChallenge(result);
    setIsActive(true);
  }, []);

  const handleStartTake = useCallback(async () => {
    if (!pool || !challenge) return;

    try {
      const res = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: pool.poolId,
          line: challenge.line,
          emotion: challenge.emotion,
        }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('currentExercise', JSON.stringify(data.data));
        router.push('/record');
      } else {
        setError(data.error || 'Failed to start exercise');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  }, [pool, challenge, router]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-white/60">Loading scene pool...</div>;

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-crimson">{error}</p>
      <button onClick={fetchPool} className="px-6 py-2 rounded-full bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-colors">Retry</button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-stage-dark via-stage to-stage-light">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-display text-gold">🎰 Scene Roulette</h1>
        <p className="text-crimson-light text-xs uppercase tracking-[0.15em] mt-1">
          {challenge ? 'Challenge Ready' : 'Spin for your scene'}
        </p>
      </div>

      {pool && (
        <div className="text-center space-y-4">
          <p className="text-white/50 text-sm">Pool: {pool.lines?.length || 0} lines, {pool.emotions?.length || 0} emotions</p>
          {!challenge && (
            <button
              onClick={handleSpin}
              disabled={loading}
              className="px-10 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-crimson to-gold text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              🎰 Spin!
            </button>
          )}
        </div>
      )}

      {isActive && challenge && (
        <button
          onClick={handleStartTake}
          className="mt-8 px-10 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-electric to-crimson text-white hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
        >
          🎬 Start take
        </button>
      )}

      {challenge && (
        <div className="mt-6 text-center max-w-md">
          <p className="text-xl font-display text-white/90">&ldquo;{challenge.line}&rdquo;</p>
          <p className="text-crimson-light text-sm mt-2 uppercase tracking-wider">{challenge.emotion}</p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stage-dark/80 to-transparent pointer-events-none" />
    </div>
  );
}
