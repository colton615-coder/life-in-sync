import { useEffect } from 'react';
import { useKV } from '@/hooks/use-kv';
import {
  ThemeProviderContext,
  ThemeProviderState,
} from '@/contexts/ThemeContext';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setTheme] = useKV<Theme>('app-theme', defaultTheme);
  const currentTheme = theme ?? defaultTheme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';

    if (currentTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = currentTheme;
    }

    root.classList.add(effectiveTheme);
  }, [currentTheme]);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return currentTheme;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (currentTheme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        const effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(effectiveTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  const value: ThemeProviderState = {
    theme: currentTheme,
    setTheme,
    effectiveTheme: getEffectiveTheme(),
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
