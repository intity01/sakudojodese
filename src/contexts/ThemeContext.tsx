import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'default' | 'cute' | 'cool' | 'dark';
export type Language = 'en' | 'th' | 'ja';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>('default');
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('sakulang-theme') as Theme;
    const savedLanguage = localStorage.getItem('sakulang-language') as Language;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('sakulang-theme', newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('sakulang-language', newLanguage);
  };

  return (
    <ThemeContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};