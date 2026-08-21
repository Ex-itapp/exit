import { useState, useEffect } from 'react';

export type ChatTheme = 'theme-default' | 'theme-midnight' | 'theme-cherry' | 'theme-serene';

export function useTheme() {
  const [theme, setTheme] = useState<ChatTheme>('theme-default');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('exit_chat_theme') as ChatTheme | null;
    if (savedTheme && ['theme-default', 'theme-midnight', 'theme-cherry', 'theme-serene'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    setIsLoaded(true);
  }, []);

  const changeTheme = (newTheme: ChatTheme) => {
    setTheme(newTheme);
    localStorage.setItem('exit_chat_theme', newTheme);
  };

  return { theme, changeTheme, isLoaded };
}
