'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import { AnalysisResult } from '@/types';

export default function FeedbackPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [attempt, setAttempt] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const result = sessionStorage.getItem('analysisResult');
      const attemptStr = sessionStorage.getItem('exerciseAttempt');
      if (!result) { router.push('/roulette'); return; }
      setAnalysis(JSON.parse(result));
      setAttempt(attemptStr === '2' ? 2 : 1);
    } catch {
      router.push('/roulette');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleRetry = useCallback(() => {
    const stored = sessionStorage.getItem('currentExercise');
    if (stored) {
      const ex = JSON.parse(stored);
      ex.attempt = 2;
      sessionStorage.setItem('currentExercise', JSON.stringify(ex));
    }
    router.push('/record');
  }, [router]);

  const handleNewScene = useCallback(() => {
    sessionStorage.removeItem('currentExercise');
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('exerciseAttempt');
    sessionStorage.removeItem('firstTakeScores');
    router.push('/roulette');
  }, [router]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-white/60">Loading feedback...</div>;
  if (!analysis) return null;

  const isFirstTake = attempt === 1;

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 bg-gradient-to-b from-stage-dark via-stage to-stage-light">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-display text-gold">
          {isFirstTake ? '📊 Take 1 Feedback' : '📊 Final Feedback'}
        </h2>
        <p className="text-crimson-light text-xs uppercase tracking-[0.15em] mt-0.5">
          {isFirstTake ? 'One more take to improve!' : 'Great work!'}
        </p>
      </div>

      <FeedbackDisplay
        feedback={analysis.feedback}
        comparison={analysis.comparison}
        onAction={isFirstTake ? handleRetry : handleNewScene}
        actionLabel={isFirstTake ? '🔄 Coached Retry' : '🎰 Spin a new scene'}
      />
    </div>
  );
}
