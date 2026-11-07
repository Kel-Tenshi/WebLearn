import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeMode } from '../../context/ThemeContext';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  Icon: LucideIcon;
}

const OPTIONS: ThemeOption[] = [
  { mode: 'light', label: 'Светлая тема', Icon: Sun },
  { mode: 'dark', label: 'Тёмная тема', Icon: Moon },
  { mode: 'system', label: 'Как в системе', Icon: Monitor },
];

interface ThemeSwitcherProps {
  variant?: 'topbar' | 'surface';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'topbar' }) => {
  const { mode, setMode } = useTheme();

  return (
    <div
      className={`theme-switcher${variant === 'surface' ? ' theme-switcher--surface' : ''}`}
      role="group"
      aria-label="Тема оформления"
    >
      {OPTIONS.map(({ mode: value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={mode === value ? 'active' : ''}
          onClick={() => setMode(value)}
          title={label}
          aria-label={label}
          aria-pressed={mode === value}
        >
          <Icon size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
};
