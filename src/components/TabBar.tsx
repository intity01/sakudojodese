import React from 'react';

type TabType = 'home' | 'plan' | 'focus' | 'learn';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: '🏠' },
    { id: 'plan' as TabType, label: 'Plan', icon: '📅' },
    { id: 'focus' as TabType, label: 'Focus', icon: '🎯' },
    { id: 'learn' as TabType, label: 'Learn', icon: '📚' }
  ];

  return (
    <nav className="tab-bar">
      <div className="tab-bar-content">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;