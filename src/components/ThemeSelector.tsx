import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

type Theme = 'system' | 'light' | 'dark';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'system', label: 'System', icon: '🖥️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'light', label: 'Light', icon: '☀️' }
  ];

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: 'var(--fg-0)',
        fontSize: '1.125rem',
        fontWeight: '600'
      }}>
        Appearance
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {themes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: theme === value ? 'var(--pri-500)' : 'transparent',
              color: theme === value ? 'white' : 'var(--fg-0)',
              border: '1px solid',
              borderColor: theme === value ? 'var(--pri-500)' : 'var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (theme !== value) {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (theme !== value) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {value === 'system' && (
              <span style={{
                fontSize: '0.75rem',
                opacity: 0.7
              }}>
                ({resolvedTheme})
              </span>
            )}
          </button>
        ))}
      </div>
      
      <p style={{
        margin: '0.75rem 0 0 0',
        fontSize: '0.75rem',
        color: 'var(--fg-muted)',
        lineHeight: '1.4'
      }}>
        Choose your preferred theme. System will follow your device settings.
      </p>
    </div>
  );
};

export default ThemeSelector;
export { ThemeSelector };