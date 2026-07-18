'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
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

  const handleComplete = useCallback(async (blob: Blob) => {
    if (!exercise) return;
    setSubmitting(true);
    setError(null);

    try {
      const feedback = await analyzeTake(exercise.line, exercise.emotion, blob);

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
    <div className="flex-1 flex flex-col items-center px-4 py-6 bg-gradient-to-b from-stage-dark via-stage to-stage-light">
      <div className="text-center mb-4">
        <h2 className="text-lg font-display text-gold">
          Take {attemptRef.current}{attemptRef.current === 2 ? ' (Coached Retry)' : ''}
        </h2>
        <p className="text-crimson-light text-xs uppercase tracking-[0.15em] mt-0.5">Record your scene</p>
      </div>

      {/* Emotion badge */}
      <div className="w-full max-w-sm mb-1">
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-electric/20 to-crimson/20 border border-electric/30">
          <span className="text-xs text-white/40 uppercase tracking-wider">Emotion:</span>
          <span className="text-sm font-bold text-electric-light uppercase tracking-wide">{exercise.emotion}</span>
        </div>
      </div>

      <CameraCapture
        challenge={`${exercise.line}`}
        onComplete={handleComplete}
        disabled={submitting}
      />

      {error && (
        <div className="mt-4 w-full max-w-sm text-crimson text-sm text-center bg-crimson/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      {submitting && (
        <div className="mt-3 text-center text-white/50 text-sm">⏳ Analyzing your take...</div>
      )}
    </div>
  );
}
