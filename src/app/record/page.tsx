'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeTake } from '@/lib/ai';
import { Exercise, AnalysisResult } from '@/types';

export default function RecordPage() {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptRef = useRef<1 | 2>(1);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentExercise');
    if (!stored) {
      router.push('/roulette');
      return;
    }
    try {
      const data = JSON.parse(stored) as Exercise;
      setExercise(data);
      attemptRef.current = data.attempt as 1 | 2;
    } catch {
      router.push('/roulette');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!exercise) return;
    setSubmitting(true);
    setError(null);

    try {
      const feedback = await analyzeTake(exercise.line, exercise.emotion);

      let result: AnalysisResult = { feedback };

      if (attemptRef.current === 2) {
        const prev = sessionStorage.getItem('firstTakeScores');
        if (prev) {
          const firstScores = JSON.parse(prev);
          result.comparison = {
            deltas: {
              emotion: feedback.scores.emotion - firstScores.emotion,
              clarity: feedback.scores.clarity - firstScores.clarity,
              pace: feedback.scores.pace - firstScores.pace,
            },
          };
        }
        sessionStorage.removeItem('firstTakeScores');
      } else {
        sessionStorage.setItem('firstTakeScores', JSON.stringify(feedback.scores));
      }

      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.setItem('exerciseAttempt', String(attemptRef.current));
      router.push('/feedback');
    } catch {
      setError('Analysis failed. Please try again.');
      setSubmitting(false);
    }
  }, [exercise, router]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-white/60">Preparing...</div>;
  if (!exercise) return null;

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 bg-gradient-to-b from-stage-dark via-stage to-stage-light">
      <div className="text-center mb-6">
        <h2 className="text-xl font-display text-gold">
          Take {attemptRef.current}{attemptRef.current === 2 ? ' (Coached Retry)' : ''}
        </h2>
        <p className="text-crimson-light text-xs uppercase tracking-[0.15em] mt-0.5">Record your scene</p>
      </div>

      <div className="w-full max-w-sm bg-stage-light/30 rounded-xl p-5 border border-gold/20 mb-8 text-center">
        <p className="text-white text-lg font-display mb-2">&ldquo;{exercise.line}&rdquo;</p>
        <p className="text-crimson-light text-sm uppercase tracking-wider font-semibold">{exercise.emotion}</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full max-w-sm py-4 rounded-full text-lg font-bold transition-all duration-200
          bg-gradient-to-r from-crimson to-gold text-white hover:scale-[1.02] active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.3)]"
      >
        {submitting ? '⏳ Analyzing...' : '🎬 Submit take'}
      </button>

      {error && (
        <div className="mt-4 w-full max-w-sm text-crimson text-sm text-center bg-crimson/10 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
