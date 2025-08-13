import { useTheme } from '../contexts/ThemeContext';
import { translations, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const { language } = useTheme();

  const t = (key: TranslationKey): string => {
    const value = translations[language][key] || translations.en[key];
    return typeof value === 'string' ? value : key;
  };

  const tNested = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, tNested, language };
};