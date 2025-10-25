'use client';

import { FF_DARK_MODE, hasFeatureAccess } from '@/libs/utils/feature-flags';
import { useSession } from 'next-auth/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const hasDarkModeAccess = hasFeatureAccess(FF_DARK_MODE, session);

  const [theme, setTheme] = useState<Theme>('auto');

  const applyTheme = useCallback(
    (theme: Theme) => {
      const html = document.documentElement;

      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const canUseDark = prefersDark.matches && hasDarkModeAccess;
        html.setAttribute('data-theme', canUseDark ? 'dark' : 'light');
      } else if (theme === 'dark' && hasDarkModeAccess) {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.setAttribute('data-theme', 'light');
      }
    },
    [hasDarkModeAccess],
  );

  const handleSetTheme = (theme: Theme) => {
    if (theme === 'dark' && !hasDarkModeAccess) {
      return;
    }

    setTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'auto';

    const validTheme =
      savedTheme === 'dark' && !hasDarkModeAccess ? 'auto' : savedTheme;
    setTheme(validTheme);
    applyTheme(validTheme);
  }, [hasDarkModeAccess, applyTheme]);

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
