import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

interface ThemeContextType {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  resolved: 'light',
  setMode: () => {},
});

function readStoredMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage может быть недоступен (приватный режим)
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches;
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return systemPrefersDark() ? 'dark' : 'light';
  }
  return mode;
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.dataset.theme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0f0e17' : '#f7f6fc');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readStoredMode()));

  useEffect(() => {
    const next = resolveTheme(mode);
    setResolved(next);
    applyTheme(next);
  }, [mode]);

  // В системном режиме следим за сменой темы ОС вживую
  useEffect(() => {
    if (mode !== 'system' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia(DARK_QUERY);
    const handleChange = () => {
      const next: ResolvedTheme = media.matches ? 'dark' : 'light';
      setResolved(next);
      applyTheme(next);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Игнорируем недоступное хранилище
    }
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
