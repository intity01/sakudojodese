// Theme Hook - Kiro Spec Compliant
// ui.theme → 'system'|'dark'|'light'

import { useState, useEffect } from 'react';

export type Theme = 'system' | 'dark' | 'light';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ui.theme') as Theme;
    return saved || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Apply theme to HTML element
  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = systemPrefersDark ? 'dark' : 'light';
      setResolvedTheme(resolved);
      
      if (resolved === 'light') {
        html.classList.add('theme-light');
      } else {
        html.classList.remove('theme-light');
      }
    } else {
      setResolvedTheme(newTheme);
      
      if (newTheme === 'light') {
        html.classList.add('theme-light');
      } else {
        html.classList.remove('theme-light');
      }
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Apply theme on mount and change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('ui.theme', newTheme);
  };

  return {
    theme,
    resolvedTheme,
    changeTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light'
  };
};