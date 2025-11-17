import { createContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
};

export const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);
