'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { use, useLayoutEffect, useMemo } from 'react';
import { browser } from 'react-dom';

export default function GalleryClient() {
  use(browser())

  const { setTheme, theme } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialTheme = useMemo(() => theme, []);

  useLayoutEffect(() => {
    setTheme('dark');

    return () => setTheme(initialTheme);
  }, [setTheme, initialTheme]);

  return null;
}
