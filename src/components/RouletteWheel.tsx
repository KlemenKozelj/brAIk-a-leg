'use client';

import { useEffect, useState, useCallback } from 'react';
import { RouletteResult } from '@/types';

interface RouletteWheelProps {
  lines: string[];
  emotions: string[];
  onSpin: () => void;
  onComplete: (result: RouletteResult) => void;
  disabled: boolean;
}

type Phase = 'idle' | 'spinning' | 'landed';

export default function RouletteWheel({
  lines,
  emotions,
  onSpin,
  onComplete,
  disabled,
}: RouletteWheelProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [lineIndex, setLineIndex] = useState(0);
  const [emotionIndex, setEmotionIndex] = useState(0);
  const [finalLine, setFinalLine] = useState('');
  const [finalEmotion, setFinalEmotion] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSpin = useCallback(() => {
    if (disabled || phase === 'spinning') return;
    onSpin();
    setPhase('spinning');

    if (prefersReducedMotion) {
      const li = Math.floor(Math.random() * lines.length);
      const ei = Math.floor(Math.random() * emotions.length);
      setFinalLine(lines[li]);
      setFinalEmotion(emotions[ei]);
      setLineIndex(li);
      setEmotionIndex(ei);
      setPhase('landed');
      onComplete({ line: lines[li], emotion: emotions[ei] });
      return;
    }

    // Animate through options
    const spinDuration = 1800;
    const interval = 60;
    const steps = spinDuration / interval;
    let step = 0;

    const animInterval = setInterval(() => {
      step++;
      setLineIndex(Math.floor(Math.random() * lines.length));
      setEmotionIndex(Math.floor(Math.random() * emotions.length));

      if (step >= steps) {
        clearInterval(animInterval);
        const li = Math.floor(Math.random() * lines.length);
        const ei = Math.floor(Math.random() * emotions.length);
        setFinalLine(lines[li]);
        setFinalEmotion(emotions[ei]);
        setLineIndex(li);
        setEmotionIndex(ei);
        setPhase('landed');
        onComplete({ line: lines[li], emotion: emotions[ei] });
      }
    }, interval);
  }, [disabled, phase, lines, emotions, onSpin, onComplete, prefersReducedMotion]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      {/* Emotion Wheel */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        <div
          className={`w-full h-full rounded-full border-2 border-gold/60 flex items-center justify-center
            ${phase === 'spinning' && !prefersReducedMotion ? 'animate-spin-slow' : ''}
            ${phase === 'landed' ? 'border-gold shadow-[0_0_20px_rgba(245,158,11,0.6)]' : ''}
          `}
          style={{ borderColor: phase === 'landed' ? '#f59e0b' : undefined }}
        >
          <span
            className={`text-sm sm:text-base font-semibold text-center px-2 transition-opacity duration-200
              ${phase === 'idle' ? 'text-gold/40' : 'text-gold'}
            `}
          >
            {phase === 'idle'
              ? '🎭'
              : phase === 'spinning'
              ? emotions[emotionIndex]
              : finalEmotion}
          </span>
        </div>
      </div>

      {/* Main Line Reel */}
      <div
        className={`w-full min-h-[5rem] sm:min-h-[6rem] rounded-xl border-2 flex items-center justify-center p-4 sm:p-6
          ${phase === 'idle' ? 'border-crimson/30 bg-stage-light/50' : ''}
          ${phase === 'spinning' && !prefersReducedMotion ? 'border-crimson/70 bg-stage-light animate-pulse-glow' : ''}
          ${phase === 'landed' ? 'border-crimson bg-stage-light shadow-[0_0_30px_rgba(220,38,38,0.4)]' : ''}
          transition-all duration-300
        `}
      >
        <p
          className={`text-center font-display text-lg sm:text-xl md:text-2xl leading-relaxed transition-all duration-200
            ${phase === 'idle' ? 'text-gold/30 text-base italic' : ''}
            ${phase === 'spinning' ? 'text-gold/80' : ''}
            ${phase === 'landed' ? 'text-white animate-bounce-in' : ''}
          `}
        >
          {phase === 'idle'
            ? 'Tap to spin your scene...'
            : phase === 'spinning'
            ? `"${lines[lineIndex]}"`
            : `"${finalLine}"`}
        </p>
      </div>

      {/* Spin Button */}
      {phase !== 'landed' && (
        <button
          onClick={handleSpin}
          disabled={disabled || phase === 'spinning'}
          className={`
            relative px-8 py-3 sm:px-10 sm:py-4 rounded-full text-lg sm:text-xl font-bold
            transition-all duration-200
            ${
              disabled || phase === 'spinning'
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-crimson to-gold text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_30px_rgba(220,38,38,0.7)]'
            }
          `}
        >
          {phase === 'spinning' ? '🎰 Spinning...' : '🎰 Spin the scene'}
        </button>
      )}

      {/* Challenge display */}
      {phase === 'landed' && (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <div className="flex gap-2 items-center">
            <span className="text-gold text-sm font-semibold uppercase tracking-wider">Your challenge</span>
          </div>
          <p className="text-electric-light text-center italic text-sm">
            Say the line as if you are {finalEmotion}
          </p>
        </div>
      )}
    </div>
  );
}
