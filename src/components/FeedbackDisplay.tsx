'use client';

import { useState, useCallback } from 'react';
import { Feedback, ScoreComparison, SCORE_LABELS } from '@/types';

interface FeedbackDisplayProps {
  feedback: Feedback;
  comparison?: ScoreComparison;
  onAction: () => void;
  actionLabel: string;
  isLoading?: boolean;
}

function ScoreRow({
  label,
  score,
  delta,
}: {
  label: string;
  score: number;
  delta?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-stage-light border border-gray-100">
      <span className="text-gray-700 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${
                star <= score ? 'text-gold-light' : 'text-gray-200'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        {delta !== undefined && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              delta > 0
                ? 'text-green-600 bg-green-50'
                : delta < 0
                ? 'text-crimson bg-crimson/5'
                : 'text-gray-400 bg-gray-100'
            }`}
          >
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function ViralScoreBar({ score }: { score: number }) {
  const fires = Math.min(score, 10);
  const label =
    score >= 9 ? '🔥 VIRAL SENSATION!' :
    score >= 7 ? '🔥 Trend material!' :
    score >= 5 ? '🔥 Decent buzz' :
    score >= 3 ? '📢 Niche audience' :
    '😴 Skip-level cringe';

  return (
    <div className="w-full p-4 rounded-xl bg-gradient-to-r from-rose-50 via-orange-50 to-yellow-50 border border-orange-200">
      <p className="text-orange-700 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        📱 Viral Potential
        <span className="text-gray-400 font-normal normal-case">(for the TikTok girlies)</span>
      </p>
      <div className="flex gap-0.5 mb-1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${
              i < fires
                ? i >= 8
                  ? 'bg-rose-500 shadow-[0_2px_6px_rgba(244,63,94,0.4)]'
                  : i >= 5
                  ? 'bg-orange-400'
                  : 'bg-yellow-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">Score: <strong className="text-gray-900">{score}/10</strong></span>
        <span className="text-xs font-bold text-orange-700">{label}</span>
      </div>
    </div>
  );
}

export default function FeedbackDisplay({
  feedback,
  comparison,
  onAction,
  actionLabel,
  isLoading = false,
}: FeedbackDisplayProps) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    const avgScore = Math.round(
      (feedback.scores.emotion + feedback.scores.clarity + feedback.scores.pace) / 3
    );
    const stars = '★'.repeat(avgScore) + '☆'.repeat(5 - avgScore);
    const fires = '🔥'.repeat(Math.min(feedback.viralScore, 5));

    const shareText =
      `🎭 I just got ROASTED on brAIk-a-leg!\n\n` +
      `${fires} Viral Score: ${feedback.viralScore}/10\n` +
      `${stars} Performance: ${avgScore}/5 stars\n\n` +
      `💀 Roast: "${feedback.roast}"\n\n` +
      `Think you can do better? 👇\n` +
      `https://braik-a-leg.app`;

    const nav = navigator as any;

    if (typeof nav !== 'undefined' && typeof nav.share === 'function') {
      try {
        await nav.share({
          title: 'brAIk-a-leg — Scene Roulette',
          text: shareText,
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          try {
            await nav.clipboard.writeText(shareText);
            setShareFeedback('📋 Copied to clipboard!');
            setTimeout(() => setShareFeedback(null), 2500);
          } catch {
            setShareFeedback('❌ Could not share');
            setTimeout(() => setShareFeedback(null), 2500);
          }
        }
      }
    } else if (typeof nav !== 'undefined' && typeof nav.clipboard?.writeText === 'function') {
      try {
        await nav.clipboard.writeText(shareText);
        setShareFeedback('📋 Copied to clipboard!');
        setTimeout(() => setShareFeedback(null), 2500);
      } catch {
        setShareFeedback('❌ Could not share');
        setTimeout(() => setShareFeedback(null), 2500);
      }
    } else {
      setShareFeedback('📋 Select & copy your score manually!');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  }, [feedback]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto animate-fade-in">
      {/* Warning Banner (mock/simulated mode) */}
      {feedback.warning && (
        <div className="w-full p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">⚠️ {feedback.warning}</p>
        </div>
      )}

      {/* Scores Section */}
      <div className="w-full space-y-1.5">
        <h3 className="text-gold text-sm font-semibold uppercase tracking-wider mb-2">
          ⭐ Performance Scores
        </h3>
        {Object.entries(feedback.scores).map(([key, score]) => (
          <ScoreRow
            key={key}
            label={SCORE_LABELS[key] || key}
            score={score}
            delta={comparison?.deltas[key as keyof typeof comparison.deltas]}
          />
        ))}
      </div>

      {/* Viral Score */}
      <ViralScoreBar score={feedback.viralScore} />

      {/* Roast */}
      <div className="w-full p-4 rounded-xl bg-gradient-to-r from-rose-50 via-purple-50 to-rose-50 border border-rose-200">
        <p className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
          💀 The Roast
        </p>
        <p className="text-gray-800 text-sm italic leading-relaxed">
          &ldquo;{feedback.roast}&rdquo;
        </p>
      </div>

      {/* Strength */}
      <div className="w-full p-4 rounded-xl bg-electric/5 border border-electric/20">
        <p className="text-electric text-xs font-semibold uppercase tracking-wider mb-1">
          💪 Strength
        </p>
        <p className="text-gray-800 text-sm">{feedback.strength}</p>
      </div>

      {/* Retry Cue */}
      <div className="w-full p-4 rounded-xl bg-gold-light/10 border border-gold-light/30">
        <p className="text-gold text-xs font-semibold uppercase tracking-wider mb-1">
          🎯 Retry cue
        </p>
        <p className="text-gray-800 text-sm">{feedback.retryCue}</p>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        {shareFeedback ? (
          <>{shareFeedback}</>
        ) : (
          <>
            <span>📤</span> Share score & roast
          </>
        )}
      </button>

      {/* Action Button */}
      <button
        onClick={onAction}
        disabled={isLoading}
        className={`
          w-full py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-200
          ${
            isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-crimson to-gold-light text-white hover:scale-[1.02] active:scale-95 shadow-lg shadow-crimson/25'
          }
        `}
      >
        {isLoading ? '⏳ Loading...' : actionLabel}
      </button>
    </div>
  );
}
