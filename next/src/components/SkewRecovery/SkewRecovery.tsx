'use client';
import { useEffect } from 'react';
import { tryRecoverFromSkew } from '@/libs/skew-recovery';

export default function SkewRecovery() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => tryRecoverFromSkew(e.error ?? e.message);
    const onRejection = (e: PromiseRejectionEvent) =>
      tryRecoverFromSkew(e.reason);

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
