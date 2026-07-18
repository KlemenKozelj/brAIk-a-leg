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
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-stage-light/50">
      <span className="text-white/80 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${
                star <= score ? 'text-gold' : 'text-white/20'
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
                ? 'text-green-400 bg-green-400/10'
                : delta < 0
                ? 'text-crimson bg-crimson/10'
                : 'text-white/40 bg-white/5'
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
    <div className="w-full p-4 rounded-xl bg-gradient-to-r from-rose-900/40 via-orange-900/30 to-yellow-900/40 border border-orange-500/30">
      <p className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        📱 Viral Potential
        <span className="text-white/20 font-normal normal-case">(for the TikTok girlies)</span>
      </p>
      <div className="flex gap-0.5 mb-1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${
              i < fires
                ? i >= 8
                  ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                  : i >= 5
                  ? 'bg-orange-400'
                  : 'bg-yellow-500'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-white/40 text-xs">Score: <strong className="text-white">{score}/10</strong></span>
        <span className="text-xs font-bold text-orange-300">{label}</span>
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
        <div className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-900/60 via-yellow-800/50 to-amber-900/60 border border-amber-500/40 text-center">
          <p className="text-amber-300 text-xs sm:text-sm leading-relaxed">{feedback.warning}</p>
        </div>
      )}

      {/* Scores Section */}
      <div className="w-full space-y-1.5">
        <h3 className="text-gold text-sm font-semibold uppercase tracking-wider mb-2">
          Performance Scores
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
      <div className="w-full p-4 rounded-xl bg-gradient-to-r from-rose-900/30 via-purple-900/20 to-rose-900/30 border border-rose-500/30">
        <p className="text-rose-300 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
          💀 The Roast
        </p>
        <p className="text-white/90 text-sm italic leading-relaxed">
          &ldquo;{feedback.roast}&rdquo;
        </p>
      </div>

      {/* Strength */}
      <div className="w-full p-4 rounded-xl bg-electric/10 border border-electric/30">
        <p className="text-electric-light text-xs font-semibold uppercase tracking-wider mb-1">
          💪 Strength
        </p>
        <p className="text-white text-sm">{feedback.strength}</p>
      </div>

      {/* Retry Cue */}
      <div className="w-full p-4 rounded-xl bg-gold/10 border border-gold/30">
        <p className="text-gold text-xs font-semibold uppercase tracking-wider mb-1">
          🎯 Retry cue
        </p>
        <p className="text-white text-sm">{feedback.retryCue}</p>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl border border-white/20 text-white/80 text-sm font-medium hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2 active:scale-95"
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
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-crimson to-gold text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
          }
        `}
      >
        {isLoading ? '⏳ Loading...' : actionLabel}
      </button>
    </div>
  );
}
