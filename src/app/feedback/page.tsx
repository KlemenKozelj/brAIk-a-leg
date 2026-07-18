'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Feedback {
  score: number;
  emotionAccuracy: number;
  delivery: number;
  strengths: string[];
  improvements: string[];
}

interface ScoreComparison {
  previous: number;
  current: number;
  delta: number;
}

interface AnalysisData {
  feedback: Feedback;
  comparison?: ScoreComparison;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [attempt, setAttempt] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const result = sessionStorage.getItem('analysisResult');
      const attemptStr = sessionStorage.getItem('exerciseAttempt');

      if (!result) {
        router.push('/roulette');
        return;
      }

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
      const exercise = JSON.parse(stored);
      exercise.attempt = 2;
      sessionStorage.setItem('currentExercise', JSON.stringify(exercise));
    }
    router.push('/record');
  }, [router]);

  const handleNewScene = useCallback(() => {
    sessionStorage.removeItem('currentExercise');
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('exerciseAttempt');
    router.push('/roulette');
  }, [router]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-white/60">Loading feedback...</div>;

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-crimson">{error}</p>
      <button onClick={() => setError(null)} className="px-6 py-2 rounded-full bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-colors">Dismiss</button>
    </div>
  );

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

      <div className="w-full max-w-md space-y-4">
        {/* Score */}
        <div className="bg-stage-light/30 rounded-xl p-4 border border-gold/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/60 text-sm">Overall Score</span>
            <span className="text-2xl font-display text-gold">{analysis.feedback.score}/100</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Emotion Accuracy</span>
              <span className="text-electric">{analysis.feedback.emotionAccuracy}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Delivery</span>
              <span className="text-electric">{analysis.feedback.delivery}/100</span>
            </div>
          </div>
          {analysis.comparison && (
            <div className="mt-3 pt-3 border-t border-gold/20">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Improvement</span>
                <span className={analysis.comparison.delta >= 0 ? 'text-green-400' : 'text-crimson'}>
                  {analysis.comparison.delta >= 0 ? '+' : ''}{analysis.comparison.delta} pts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Strengths */}
        <div className="bg-stage-light/30 rounded-xl p-4 border border-gold/20">
          <h3 className="text-gold text-sm font-semibold uppercase tracking-wider mb-2">Strengths</h3>
          <ul className="space-y-1">
            {analysis.feedback.strengths.map((s, i) => (
              <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✦</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-stage-light/30 rounded-xl p-4 border border-gold/20">
          <h3 className="text-crimson text-sm font-semibold uppercase tracking-wider mb-2">Areas to Improve</h3>
          <ul className="space-y-1">
            {analysis.feedback.improvements.map((imp, i) => (
              <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                <span className="text-crimson mt-0.5">✦</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={isFirstTake ? handleRetry : handleNewScene}
        className="mt-8 px-10 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-electric to-crimson text-white hover:scale-105 active:scale-95 transition-all"
      >
        {isFirstTake ? '🔄 Coached Retry' : '🎰 Spin a new scene'}
      </button>
    </div>
  );
}
