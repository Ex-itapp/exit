import { useState, useEffect } from 'react';

export type ChatTheme = 'theme-cream' | 'theme-midnight' | 'theme-rose' | 'theme-ocean' | 'theme-sage' | 'theme-carbon';

export type ChatMood = 'companion' | 'ex';

export type ToneOption = 'tough-love' | 'hype' | 'gentle' | 'reflective';

export interface ThemePreview {
  id: ChatTheme;
  name: string;
  bg: string;
  ink: string;
  accent: string;
  brand: string;
}

export const THEME_PREVIEWS: ThemePreview[] = [
  { id: 'theme-cream', name: 'Cream', bg: '#F5EFE6', ink: '#111111', accent: '#FF3366', brand: '#FFDF00' },
  { id: 'theme-midnight', name: 'Midnight', bg: '#0F0F0F', ink: '#F5EFE6', accent: '#FF3366', brand: '#9D4EDD' },
  { id: 'theme-rose', name: 'Rosé', bg: '#FFF0F5', ink: '#5C1A33', accent: '#C70039', brand: '#D4A373' },
  { id: 'theme-ocean', name: 'Ocean', bg: '#0B1426', ink: '#E0E8F0', accent: '#FF5252', brand: '#FF8C42' },
  { id: 'theme-sage', name: 'Sage', bg: '#ECF0E8', ink: '#2D3B2D', accent: '#C44536', brand: '#D4A373' },
  { id: 'theme-carbon', name: 'Carbon', bg: '#0A0A0A', ink: '#E5E5E5', accent: '#FF3366', brand: '#FF3366' },
];

export const TONE_OPTIONS: { id: ToneOption; emoji: string; label: string; description: string }[] = [
  { id: 'tough-love', emoji: '🔥', label: 'Tough Love', description: 'Direct, sarcastic, accountability partner' },
  { id: 'hype', emoji: '🎉', label: 'Hype', description: 'Your biggest cheerleader, gas you up' },
  { id: 'gentle', emoji: '🫂', label: 'Gentle', description: 'Patient, validating, let you vent' },
  { id: 'reflective', emoji: '🔍', label: 'Reflective', description: 'Thoughtful, probing questions' },
];

const STORAGE_KEY_COMPANION_THEME = 'exit_companion_theme';
const STORAGE_KEY_EX_THEME = 'exit_ex_theme';
const STORAGE_KEY_TONE = 'exit_companion_tone';

const DEFAULT_COMPANION_THEME: ChatTheme = 'theme-cream';
const DEFAULT_EX_THEME: ChatTheme = 'theme-cream';

const VALID_THEMES: ChatTheme[] = ['theme-cream', 'theme-midnight', 'theme-rose', 'theme-ocean', 'theme-sage', 'theme-carbon'];

export function useTheme(mood: ChatMood = 'companion') {
  const storageKey = mood === 'companion' ? STORAGE_KEY_COMPANION_THEME : STORAGE_KEY_EX_THEME;
  const defaultTheme = mood === 'companion' ? DEFAULT_COMPANION_THEME : DEFAULT_EX_THEME;

  const [theme, setTheme] = useState<ChatTheme>(defaultTheme);
  const [tone, setToneState] = useState<ToneOption>('gentle');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as ChatTheme | null;
    if (savedTheme && VALID_THEMES.includes(savedTheme)) {
      setTheme(savedTheme);
    }

    const savedTone = localStorage.getItem(STORAGE_KEY_TONE) as ToneOption | null;
    if (savedTone && ['tough-love', 'hype', 'gentle', 'reflective'].includes(savedTone)) {
      setToneState(savedTone);
    }

    setIsLoaded(true);
  }, [storageKey]);

  const changeTheme = (newTheme: ChatTheme) => {
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const changeTone = (newTone: ToneOption) => {
    setToneState(newTone);
    localStorage.setItem(STORAGE_KEY_TONE, newTone);
  };

  return { theme, changeTheme, tone, changeTone, isLoaded };
}
