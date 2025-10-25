'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useEffect, useRef } from 'react';

/**
 * Utility component to, for example, force a certain page to be light mode only.
 * Restores the original theme when this component unmounts (e.g. on navigation).
 */
export const ForceLightMode = () => {
  const { setTheme } = useTheme();
  const originalTheme = useRef<string | null>(null);

  useEffect(() => {
    originalTheme.current = window.localStorage.getItem('theme') || 'auto';
    setTheme('light');

    return () => {
      if (originalTheme.current) {
        setTheme(originalTheme.current as 'auto' | 'light' | 'dark');
      }
    };
  }, [setTheme]);

  return null;
};
