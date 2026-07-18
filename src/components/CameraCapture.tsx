'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  challenge: string;
  onComplete: (blob: Blob) => void;
  onRetry?: () => void;
  disabled?: boolean;
}

type CameraState = 'idle' | 'countdown' | 'recording' | 'preview' | 'submitted';

export default function CameraCapture({
  challenge,
  onComplete,
  onRetry,
  disabled = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<CameraState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const MAX_DURATION = 5;

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState('countdown');
      setCountdown(3);
    } catch (err) {
      setError('Camera access denied. Please grant camera permissions.');
    }
  }, []);

  useEffect(() => {
    if (state !== 'countdown') return;
    if (countdown <= 0) {
      startRecording();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordingTime(0);
    setState('recording');

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setState('preview');
      stopStream();
    };

    recorder.start(100);
    mediaRecorderRef.current = recorder;

    // Auto-stop after max duration
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRecordingTime(elapsed);
      if (elapsed >= MAX_DURATION) {
        clearInterval(interval);
        stopRecording();
      }
    }, 100);
    timerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (recordedBlob) {
      setState('submitted');
      onComplete(recordedBlob);
    }
  }, [recordedBlob, onComplete]);

  const handleReRecord = useCallback(() => {
    setRecordedBlob(null);
    setState('idle');
    setRecordingTime(0);
    onRetry?.();
  }, [onRetry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stopStream]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      {/* Challenge reminder */}
      <div className="text-center p-3 rounded-lg bg-stage-light border border-crimson/30 w-full">
        <p className="text-white font-display text-sm sm:text-base">
          &ldquo;{challenge}&rdquo;
        </p>
      </div>

      {/* Camera / Preview */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-black border-2 border-gold/30">
        {(state === 'idle' || state === 'countdown') && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {state === 'recording' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse" />
              <span className="text-white text-xs font-mono">
                {recordingTime.toFixed(1)}s / {MAX_DURATION}s
              </span>
            </div>
          </>
        )}

        {state === 'preview' && recordedBlob && (
          <video
            ref={previewRef}
            src={URL.createObjectURL(recordedBlob)}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {state === 'idle' && !streamRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-stage-dark/80">
            <div className="text-center text-gold/60">
              <p className="text-4xl mb-2">🎥</p>
              <p className="text-sm">Camera off</p>
            </div>
          </div>
        )}

        {/* Countdown overlay */}
        {state === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-6xl sm:text-8xl font-bold text-gold animate-bounce-in">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-crimson text-sm text-center bg-crimson/10 p-3 rounded-lg w-full">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {state === 'idle' && (
          <button
            onClick={startCamera}
            disabled={disabled}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-crimson to-gold text-white font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎬 Start recording
          </button>
        )}

        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex-1 py-3 rounded-full bg-crimson text-white font-bold hover:bg-crimson-dark transition-all"
          >
            ⏹ Stop
          </button>
        )}

        {state === 'preview' && (
          <>
            <button
              onClick={handleReRecord}
              className="flex-1 py-3 rounded-full border border-gold text-gold font-bold hover:bg-gold/10 transition-all"
            >
              🔄 Re-record
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-electric to-crimson text-white font-bold hover:scale-[1.02] active:scale-95 transition-all"
            >
              ✅ Submit take
            </button>
          </>
        )}
      </div>
    </div>
  );
}
