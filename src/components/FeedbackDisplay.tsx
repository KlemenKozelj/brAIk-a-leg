'use client';

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

export default function FeedbackDisplay({
  feedback,
  comparison,
  onAction,
  actionLabel,
  isLoading = false,
}: FeedbackDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto animate-fade-in">
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
