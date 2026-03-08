'use client';
import { resetReloadCount } from '@/libs/utils/stale-deployment';
import { useEffect } from 'react';

export default function StaleDeploymentRecovery() {
  useEffect(() => {
    resetReloadCount();
  }, []);

  return null;
}
