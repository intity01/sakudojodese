import React from 'react';

interface AppBarProps {
  onQuickAdd?: () => void;
  onSearch?: () => void;
  onSettings?: () => void;
}

const AppBar: React.FC<AppBarProps> = ({
  onQuickAdd,
  onSearch,
  onSettings
}) => {
  return (
    <header className="app-bar">
      <div className="app-bar-content">
        {/* Logo */}
        <div className="app-bar-logo">
          <h1>Kiro</h1>
        </div>

        {/* Center - Search */}
        <div className="app-bar-center">
          <button 
            type="button"
            className="search-button"
            onClick={onSearch}
            title="Search (Cmd/⌘+K)"
          >
            🔍 Search
          </button>
        </div>

        {/* Right - Actions */}
        <div className="app-bar-actions">
          <button 
            type="button"
            className="quick-add-button"
            onClick={onQuickAdd}
            title="Quick Add"
          >
            +
          </button>
          
          <div className="max-lock-badge">
            MAX‑LOCK
          </div>
          
          <button 
            type="button"
            className="menu-button"
            onClick={onSettings}
            title="Settings"
          >
            ⋯
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppBar;