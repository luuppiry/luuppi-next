'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const resolved =
    theme === 'auto' ? (prefersDark.matches ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto');

  const handleSetTheme = (theme: Theme) => {
    setTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };

  useEffect(() => {
    const theme = (localStorage.getItem('theme') as Theme) || 'auto';

    // Should run after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(theme);
    applyTheme(theme);
  }, []);

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

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
