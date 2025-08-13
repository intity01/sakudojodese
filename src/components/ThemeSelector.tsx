import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { id: 'default', name: '💙 Minimal Blue', preview: '#6366F1' },
    { id: 'cute', name: '💖 Cute Pink', preview: '#EC4899' },
    { id: 'cool', name: '🌊 Cool Cyan', preview: '#06B6D4' },
    { id: 'dark', name: '🌙 Dark Mode', preview: '#1F2937' }
  ] as const;

  return (
    <div className="theme-selector">
      <h3 className="text-lg font-semibold mb-4">{t('appearance')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id as any)}
            className={`theme-option ${theme === themeOption.id ? 'active' : ''}`}
          >
            <div 
              className="theme-preview"
              style={{ backgroundColor: themeOption.preview }}
            />
            <span className="theme-name">{themeOption.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;