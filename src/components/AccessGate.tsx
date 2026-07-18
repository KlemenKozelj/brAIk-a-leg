'use client';

import { useState } from 'react';

interface AccessGateProps {
  onAccess: () => void;
  error?: string | null;
}

export default function AccessGate({ onAccess, error: serverError }: AccessGateProps) {
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [consentVideo, setConsentVideo] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!confirmedAge) {
      setLocalError('You must confirm you are 18 or older.');
      return;
    }
    if (!consentVideo) {
      setLocalError('You must consent to video processing.');
      return;
    }

    onAccess();
  };

  const displayError = localError || serverError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stage-dark via-stage to-stage-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-display text-gold mb-2">
            🎭 Actor Coach
          </h1>
          <p className="text-crimson-light text-sm font-semibold uppercase tracking-[0.2em]">
            Scene Roulette
          </p>
          <p className="text-white/40 text-xs mt-2">Private Pilot</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-stage-light/50 rounded-2xl p-6 border border-gold/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        >
          <div className="text-center">
            <p className="text-white/60 text-sm">
              Welcome to the private pilot. Confirm below to enter the stage.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={confirmedAge}
              onChange={(e) => setConfirmedAge(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gold/50 bg-stage-dark text-electric focus:ring-electric"
            />
            <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
              I confirm I am 18 years of age or older
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentVideo}
              onChange={(e) => setConsentVideo(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gold/50 bg-stage-dark text-electric focus:ring-electric"
            />
            <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
              I consent to my video being temporarily processed for AI analysis. Videos
              are not stored or retained after analysis.
            </span>
          </label>

          {displayError && (
            <div className="text-crimson text-sm text-center bg-crimson/10 p-3 rounded-lg">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-crimson to-gold text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            🎭 Enter the Stage
          </button>
        </form>
      </div>
    </div>
  );
}
