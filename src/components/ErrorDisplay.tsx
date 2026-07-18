'use client';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
      <span className="text-4xl">⚠️</span>
      <p className="text-crimson text-center text-sm sm:text-base">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-full border border-crimson text-crimson hover:bg-crimson/10 transition-all text-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
}
