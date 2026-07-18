'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const SHAKE_THRESHOLD = 18; // m/s² — high enough to avoid false triggers
const DEBOUNCE_MS = 2500; // prevent double-triggering

export function useShake(onShake: () => void) {
  const [hasPermission, setHasPermission] = useState(false);
  const lastShakeRef = useRef(0);
  const listenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        setHasPermission(result === 'granted');
        return result === 'granted';
      } catch {
        setHasPermission(false);
        return false;
      }
    }
    // Non-iOS or older iOS — permission not needed
    setHasPermission(true);
    return true;
  }, []);

  useEffect(() => {
    // Check if permission is needed on iOS
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission !== 'function'
    ) {
      setHasPermission(true);
    }

    const handler = (event: DeviceMotionEvent) => {
      const acc = event.acceleration;
      if (!acc) return;

      const magnitude = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2
      );

      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeRef.current > DEBOUNCE_MS) {
          lastShakeRef.current = now;
          onShake();
        }
      }
    };

    listenerRef.current = handler;

    if (hasPermission) {
      window.addEventListener('devicemotion', handler);
    }

    return () => {
      if (listenerRef.current) {
        window.removeEventListener('devicemotion', listenerRef.current);
      }
    };
  }, [hasPermission, onShake]);

  return { hasPermission, requestPermission };
}
