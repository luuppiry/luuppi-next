'use client';

import { Dictionary } from '@/models/locale';
import { useTheme } from '@/providers/ThemeProvider';
import { useState } from 'react';
import { BsDisplay, BsMoon, BsSun } from 'react-icons/bs';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeSwitcherProps {
  dictionary: Dictionary['theme'];
}

export default function ThemeSwitcher({ dictionary }: ThemeSwitcherProps) {
  const { theme: currentTheme, setTheme: setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setIsOpen(false);
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <BsSun size={16} />;
      case 'dark':
        return <BsMoon size={16} />;
      default:
        return <BsDisplay size={16} />;
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return dictionary?.light || 'Light';
      case 'dark':
        return dictionary?.dark || 'Dark';
      default:
        return dictionary?.auto || 'Auto';
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div
        className="btn btn-circle btn-ghost m-1 bg-primary-600 max-lg:bg-secondary-400"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1 text-white">
          {getThemeIcon(currentTheme)}
        </div>
      </div>
      {isOpen && (
        <ul
          className="menu dropdown-content z-[1] w-48 gap-2 rounded-box bg-base-100 p-2 font-bold text-base-content shadow"
          tabIndex={0}
        >
          {(['auto', 'light', 'dark'] as ThemeMode[]).map((mode) => (
            <li
              key={mode}
              className={currentTheme === mode ? 'rounded-lg bg-base-300' : ''}
            >
              <button
                className="flex items-center gap-2"
                onClick={() => handleThemeChange(mode)}
              >
                {getThemeIcon(mode)}
                {getThemeLabel(mode)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
