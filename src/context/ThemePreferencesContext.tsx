'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ColorScheme = 'amber' | 'emerald' | 'blue' | 'rose' | 'violet' | 'slate';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type FontPair = 'classic' | 'modern' | 'minimal' | 'playful';

interface ThemePreferences {
  colorScheme: ColorScheme;
  density: Density;
  fontPair: FontPair;
}

interface ThemePreferencesContextType {
  preferences: ThemePreferences;
  updatePreferences: (newPrefs: Partial<ThemePreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: ThemePreferences = {
  colorScheme: 'amber',
  density: 'comfortable',
  fontPair: 'classic',
};

const STORAGE_KEY = 'culturalvault_theme_preferences';

const ThemePreferencesContext = createContext<ThemePreferencesContextType | undefined>(undefined);

export function ThemePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultPreferences);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (e) {
        console.error('Error parsing theme preferences:', e);
      }
    }
  }, []);

  // Sync to HTML element attribute and localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    // Update root HTML element attributes
    const root = document.documentElement;
    root.setAttribute('data-color-scheme', preferences.colorScheme);
    root.setAttribute('data-density', preferences.density);
    root.setAttribute('data-font-pair', preferences.fontPair);

    // Apply color palettes dynamically to tailwind variables/styles
    root.style.setProperty('--color-primary', getColorHex(preferences.colorScheme));
    
    // Manage dynamic font pairing variables on root
    const fonts = getFontsForPair(preferences.fontPair);
    root.style.setProperty('--font-custom-heading', fonts.heading);
    root.style.setProperty('--font-custom-body', fonts.body);
  }, [preferences]);

  const updatePreferences = useCallback((newPrefs: Partial<ThemePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  return (
    <ThemePreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </ThemePreferencesContext.Provider>
  );
}

export function useThemePreferences() {
  const context = useContext(ThemePreferencesContext);
  if (!context) {
    throw new Error('useThemePreferences must be used within ThemePreferencesProvider');
  }
  return context;
}

// Helper colors hex
function getColorHex(scheme: ColorScheme): string {
  switch (scheme) {
    case 'emerald': return '#10b981';
    case 'blue': return '#2563eb';
    case 'rose': return '#e11d48';
    case 'violet': return '#7c3aed';
    case 'slate': return '#475569';
    case 'amber':
    default: return '#b45309';
  }
}

// Font configs helper
function getFontsForPair(pair: FontPair): { heading: string; body: string } {
  switch (pair) {
    case 'modern':
      return { 
        heading: '"Inter", sans-serif', 
        body: '"Inter", sans-serif' 
      };
    case 'minimal':
      return { 
        heading: '"JetBrains Mono", monospace', 
        body: 'system-ui, sans-serif' 
      };
    case 'playful':
      return { 
        heading: '"Space Grotesk", sans-serif', 
        body: '"Inter", sans-serif' 
      };
    case 'classic':
    default:
      return { 
        heading: '"Space Grotesk", "Playfair Display", serif', 
        body: '"Inter", sans-serif' 
      };
  }
}
