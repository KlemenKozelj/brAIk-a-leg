'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ExerciseData {
  id: string;
  line: string;
  emotion: string;
  attempt: number;
}

export default function RecordPage() {
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
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
      const data = JSON.parse(stored) as ExerciseData;
      setExercise(data);
      attemptRef.current = data.attempt as 1 | 2;
    } catch {
      router.push('/roulette');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = useCallback(
    async (blob: Blob) => {
      if (!exercise) return;
      setSubmitting(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('video', blob, 'take.webm');
        formData.append('exerciseId', exercise.id);
        formData.append('attempt', String(attemptRef.current));
        formData.append('poolId', 'pool');
        formData.append('line', exercise.line);
        formData.append('emotion', exercise.emotion);
        formData.append('duration', String(5));

        const res = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('analysisResult', JSON.stringify(data.data));
          sessionStorage.setItem('exerciseAttempt', String(attemptRef.current));
          router.push('/feedback');
        } else {
          setError(data.error || 'Analysis failed. Please try again.');
          setSubmitting(false);
        }
      } catch {
        setError('Network error. Please try again.');
        setSubmitting(false);
      }
    },
    [exercise, router]
  );

  if (loading) return <div className="flex-1 flex items-center justify-center text-white/60">Preparing camera...</div>;

  if (!exercise) return null;

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 bg-gradient-to-b from-stage-dark via-stage to-stage-light">
      <div className="text-center mb-4">
        <h2 className="text-lg font-display text-gold">
          Take {attemptRef.current} {attemptRef.current === 2 ? '(Coached Retry)' : ''}
        </h2>
        <p className="text-crimson-light text-xs uppercase tracking-[0.15em] mt-0.5">Record your scene</p>
      </div>

      <div className="w-full max-w-sm bg-stage-light/30 rounded-xl p-4 mb-6 border border-gold/20">
        <p className="text-center text-sm text-white/80">&ldquo;{exercise.line}&rdquo;</p>
        <p className="text-center text-crimson-light text-xs uppercase tracking-wider mt-1">{exercise.emotion}</p>
      </div>

      <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-stage-dark border-2 border-gold/30 flex items-center justify-center mb-6">
        <p className="text-white/40 text-sm">📷 Camera placeholder</p>
      </div>

      <button
        onClick={() => handleSubmit(new Blob(['fake-video'], { type: 'video/webm' }))}
        disabled={submitting}
        className="w-full max-w-sm py-4 rounded-full text-lg font-bold bg-gradient-to-r from-crimson to-gold text-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
      >
        {submitting ? '⏳ Analyzing...' : '🎬 Record & Submit'}
      </button>

      {error && (
        <div className="mt-4 w-full max-w-sm text-crimson text-sm text-center bg-crimson/10 p-3 rounded-lg">{error}</div>
      )}

      {submitting && (
        <div className="mt-4 text-center text-white/50 text-sm">🎬 Analyzing your take...</div>
      )}
    </div>
  );
}
