'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ColorTheme, LayoutMode, COLOR_THEMES, DEFAULT_COLOR_THEME, DEFAULT_LAYOUT } from '@/src/theme/config';

interface ThemeContextType {
  colorTheme: ColorTheme;
  layout: LayoutMode;
  setColorTheme: (theme: ColorTheme) => void;
  setLayout: (layout: LayoutMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_THEME = 'culturalvault_color_theme';
const STORAGE_KEY_LAYOUT = 'culturalvault_layout';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(DEFAULT_COLOR_THEME);
  const [layout, setLayoutState] = useState<LayoutMode>(DEFAULT_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage khi mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ColorTheme | null;
    const storedLayout = localStorage.getItem(STORAGE_KEY_LAYOUT) as LayoutMode | null;

    if (storedTheme && COLOR_THEMES[storedTheme]) {
      setColorThemeState(storedTheme);
    }
    if (storedLayout && ['grid', 'list', 'compact'].includes(storedLayout)) {
      setLayoutState(storedLayout);
    }
    setIsLoaded(true);
  }, []);

  // Lưu vào localStorage và áp dụng class/variables khi thay đổi
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY_THEME, colorTheme);
    
    // Áp dụng class cho html element
    const root = document.documentElement;
    root.classList.remove('theme-amber', 'theme-blue', 'theme-green', 'theme-purple', 'theme-pink', 'theme-rose');
    root.classList.add(`theme-${colorTheme}`);

    // Set document level attribute reflecting color-theme
    root.setAttribute('data-color-theme', colorTheme);

  }, [colorTheme, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY_LAYOUT, layout);
  }, [layout, isLoaded]);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
  }, []);

  const setLayout = useCallback((layoutVal: LayoutMode) => {
    setLayoutState(layoutVal);
  }, []);

  return (
    <ThemeContext.Provider value={{ colorTheme, layout, setColorTheme, setLayout }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
