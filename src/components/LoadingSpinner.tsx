export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-10 h-10 border-3 border-gold-light/30 border-t-gold rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">✨ {message}</p>
    </div>
  );
}
