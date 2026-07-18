'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAccess = useCallback(
    async (confirmedAge: boolean, consentVideo: boolean) => {
      if (!confirmedAge) {
        setError('You must confirm you are 18 or older.');
        return;
      }
      if (!consentVideo) {
        setError('You must consent to video processing.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmedAge, consentVideo }),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || 'Access denied');
          setLoading(false);
          return;
        }

        router.push('/roulette');
      } catch {
        setError('Network error. Please try again.');
        setLoading(false);
      }
    },
    [router]
  );

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
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const confirmedAge = (form.elements.namedItem('age') as HTMLInputElement).checked;
            const consentVideo = (form.elements.namedItem('consent') as HTMLInputElement).checked;

            if (!confirmedAge) {
              setError('You must confirm you are 18 or older.');
              return;
            }
            if (!consentVideo) {
              setError('You must consent to video processing.');
              return;
            }

            handleAccess(confirmedAge, consentVideo);
          }}
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
              name="age"
              className="mt-1 w-4 h-4 rounded border-gold/50 bg-stage-dark text-electric focus:ring-electric"
            />
            <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
              I confirm I am 18 years of age or older
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="consent"
              className="mt-1 w-4 h-4 rounded border-gold/50 bg-stage-dark text-electric focus:ring-electric"
            />
            <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
              I consent to my video being temporarily processed for AI analysis. Videos
              are not stored or retained after analysis.
            </span>
          </label>

          {error && (
            <div className="text-crimson text-sm text-center bg-crimson/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-crimson to-gold text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Entering...' : '🎭 Enter the Stage'}
          </button>
        </form>
      </div>
    </div>
  );
}
