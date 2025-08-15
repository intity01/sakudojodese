import React, { useState } from 'react';

type Language = 'EN' | 'JP';
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
type ContentType = 'vocab' | 'grammar' | 'reading' | 'listening' | 'pronunciation' | 'conversation';
type License = 'CC-BY' | 'CC-BY-SA' | 'EDRDG' | 'Public-Domain' | 'Other';
type StudyMode = 'flashcards' | 'quiz' | 'dictation' | 'conversation';

interface LearnItem {
  id: string;
  title: string;
  type: ContentType;
  language: Language;
  level: Level;
  license: License;
  source: string;
  description: string;
  itemCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  lastStudied?: string;
  progress?: number; // 0-100
}

interface StudySession {
  itemId: string;
  mode: StudyMode;
  startTime: Date;
  progress: number;
  totalItems: number;
}

interface LearnScreenProps {
  onStartStudySession?: (itemId: string, mode: StudyMode) => void;
}

const LearnScreen: React.FC<LearnScreenProps> = ({ onStartStudySession }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('EN');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectedItem, setSelectedItem] = useState<LearnItem | null>(null);
  const [showStudyModes, setShowStudyModes] = useState(false);

  // Enhanced mock data with more details
  const learnItems: LearnItem[] = [
    {
      id: '1',
      title: 'Business Vocabulary A2',
      type: 'vocab',
      language: 'EN',
      level: 'A2',
      license: 'CC-BY',
      source: 'NGSL',
      description: '200 essential business terms for workplace communication',
      itemCount: 200,
      difficulty: 'Medium',
      tags: ['business', 'workplace', 'professional'],
      lastStudied: '2024-08-14',
      progress: 65
    },
    {
      id: '2',
      title: 'Particles Practice N3',
      type: 'grammar',
      language: 'JP',
      level: 'N3',
      license: 'EDRDG',
      source: 'JMdict',
      description: 'Master Japanese particles with practical examples',
      itemCount: 150,
      difficulty: 'Hard',
      tags: ['particles', 'grammar', 'jlpt'],
      lastStudied: '2024-08-13',
      progress: 30
    },
    {
      id: '3',
      title: 'Daily Conversation B1',
      type: 'conversation',
      language: 'EN',
      level: 'B1',
      license: 'CC-BY-SA',
      source: 'Tatoeba',
      description: 'Common conversation phrases for everyday situations',
      itemCount: 180,
      difficulty: 'Easy',
      tags: ['conversation', 'daily', 'speaking'],
      progress: 85
    },
    {
      id: '4',
      title: 'Academic Writing C1',
      type: 'reading',
      language: 'EN',
      level: 'C1',
      license: 'CC-BY',
      source: 'NAWL',
      description: 'Advanced academic vocabulary and writing patterns',
      itemCount: 300,
      difficulty: 'Hard',
      tags: ['academic', 'writing', 'advanced'],
      progress: 20
    },
    {
      id: '5',
      title: 'Pronunciation Drills N4',
      type: 'pronunciation',
      language: 'JP',
      level: 'N4',
      license: 'EDRDG',
      source: 'KANJIDIC2',
      description: 'Practice Japanese pronunciation with audio examples',
      itemCount: 120,
      difficulty: 'Medium',
      tags: ['pronunciation', 'audio', 'speaking'],
      lastStudied: '2024-08-12',
      progress: 45
    }
  ];

  const filteredItems = learnItems.filter(item => {
    if (selectedLanguage && item.language !== selectedLanguage) return false;
    if (selectedLevel && item.level !== selectedLevel) return false;
    if (selectedType && item.type !== selectedType) return false;
    return true;
  });

  const getLicenseBadgeColor = (license: License) => {
    switch (license) {
      case 'CC-BY': return 'badge-blue';
      case 'CC-BY-SA': return 'badge-green';
      case 'EDRDG': return 'badge-purple';
      case 'Public-Domain': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'badge-success';
      case 'Medium': return 'badge-warning';
      case 'Hard': return 'badge-danger';
      default: return 'badge-default';
    }
  };

  const handleStartStudy = (item: LearnItem) => {
    setSelectedItem(item);
    setShowStudyModes(true);
  };

  const handleSelectStudyMode = (mode: StudyMode) => {
    if (selectedItem && onStartStudySession) {
      onStartStudySession(selectedItem.id, mode);
    }
    setShowStudyModes(false);
    setSelectedItem(null);
  };

  const studyModes = [
    {
      id: 'flashcards' as StudyMode,
      title: 'Flashcards',
      description: 'Spaced repetition learning with confidence rating',
      icon: '🃏',
      duration: '10-15 min',
      difficulty: 'Easy'
    },
    {
      id: 'quiz' as StudyMode,
      title: 'Multiple Choice',
      description: 'Test your knowledge with instant explanations',
      icon: '❓',
      duration: '5-10 min',
      difficulty: 'Medium'
    },
    {
      id: 'dictation' as StudyMode,
      title: 'Dictation',
      description: 'Listen and type what you hear',
      icon: '🎧',
      duration: '15-20 min',
      difficulty: 'Hard'
    },
    {
      id: 'conversation' as StudyMode,
      title: 'Conversation',
      description: 'Practice speaking with AI prompts',
      icon: '💬',
      duration: '20-30 min',
      difficulty: 'Medium'
    }
  ];

  return (
    <div className="learn-screen">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-section">
          <label>Language</label>
          <div className="filter-pills">
            <button 
              className={`filter-pill ${selectedLanguage === 'EN' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('EN')}
            >
              EN
            </button>
            <button 
              className={`filter-pill ${selectedLanguage === 'JP' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('JP')}
            >
              JP
            </button>
          </div>
        </div>

        <div className="filter-section">
          <label>Level</label>
          <div className="filter-pills">
            {selectedLanguage === 'EN' ? (
              <>
                {['A1', 'A2', 'B1', 'B2', 'C1'].map(level => (
                  <button 
                    key={level}
                    className={`filter-pill ${selectedLevel === level ? 'active' : ''}`}
                    onClick={() => setSelectedLevel(selectedLevel === level ? null : level as Level)}
                  >
                    {level}
                  </button>
                ))}
              </>
            ) : (
              <>
                {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                  <button 
                    key={level}
                    className={`filter-pill ${selectedLevel === level ? 'active' : ''}`}
                    onClick={() => setSelectedLevel(selectedLevel === level ? null : level as Level)}
                  >
                    {level}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="filter-section">
          <label>Type</label>
          <div className="filter-pills">
            {['vocab', 'grammar', 'reading', 'listening', 'pronunciation'].map(type => (
              <button 
                key={type}
                className={`filter-pill ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(selectedType === type ? null : type as ContentType)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="learn-content">
        <div className="content-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="learn-card">
              <div className="card-header">
                <div className="card-title-section">
                  <h3>{item.title}</h3>
                  <div className="card-badges">
                    <span className={`badge ${getLicenseBadgeColor(item.license)}`}>
                      {item.license}
                    </span>
                    <span className="badge badge-default">{item.level}</span>
                    <span className={`badge ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                </div>
                
                {item.progress !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{item.progress}%</span>
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <p>{item.description}</p>
                
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-value">{item.itemCount}</span>
                    <span className="stat-label">items</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{item.tags.length}</span>
                    <span className="stat-label">tags</span>
                  </div>
                  {item.lastStudied && (
                    <div className="stat">
                      <span className="stat-value">
                        {new Date(item.lastStudied).toLocaleDateString('th-TH', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="stat-label">last studied</span>
                    </div>
                  )}
                </div>
                
                <div className="card-tags">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="tag-more">+{item.tags.length - 3}</span>
                  )}
                </div>
                
                <div className="card-meta">
                  <span className="source">Source: {item.source}</span>
                  <span className="type">{item.type}</span>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStartStudy(item)}
                >
                  เริ่มเรียน
                </button>
                <button className="btn btn-secondary btn-sm">
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <p>ไม่พบเนื้อหาที่ตรงกับตัวกรอง</p>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedLevel(null);
                setSelectedType(null);
              }}
            >
              ล้างตัวกรอง
            </button>
          </div>
        )}
      </div>

      {/* Study Mode Selection Modal */}
      {showStudyModes && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowStudyModes(false)}>
          <div className="modal-content study-mode-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>เลือกโหมดการเรียน</h3>
              <button 
                className="modal-close"
                onClick={() => setShowStudyModes(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="selected-item-info">
                <h4>{selectedItem.title}</h4>
                <p>{selectedItem.description}</p>
                <div className="item-stats">
                  <span>{selectedItem.itemCount} items</span>
                  <span>•</span>
                  <span>{selectedItem.difficulty}</span>
                  <span>•</span>
                  <span>{selectedItem.level}</span>
                </div>
              </div>
              
              <div className="study-modes-grid">
                {studyModes.map(mode => (
                  <button
                    key={mode.id}
                    className="study-mode-card"
                    onClick={() => handleSelectStudyMode(mode.id)}
                  >
                    <div className="mode-icon">{mode.icon}</div>
                    <div className="mode-content">
                      <h4>{mode.title}</h4>
                      <p>{mode.description}</p>
                      <div className="mode-meta">
                        <span className="duration">{mode.duration}</span>
                        <span className={`difficulty ${mode.difficulty.toLowerCase()}`}>
                          {mode.difficulty}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnScreen;