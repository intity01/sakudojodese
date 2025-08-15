import React, { useState, useEffect } from 'react';
import { ThemeSelector } from './ThemeSelector';

interface SettingsScreenProps {
  onBack: () => void;
}

interface Settings {
  enableDictionary: boolean;
  enableCustomQuestions: boolean;
  enableAnimations: boolean;
  enableSounds: boolean;
  autoSave: boolean;
  showTips: boolean;
  language: 'th' | 'en';
  theme: 'system' | 'light' | 'dark';
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<Settings>({
    enableDictionary: true,
    enableCustomQuestions: true,
    enableAnimations: true,
    enableSounds: false,
    autoSave: true,
    showTips: true,
    language: 'th',
    theme: 'system'
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('sakulang-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('sakulang-settings', JSON.stringify(newSettings));
  };

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าทั้งหมด?')) {
      const defaultSettings: Settings = {
        enableDictionary: true,
        enableCustomQuestions: true,
        enableAnimations: true,
        enableSounds: false,
        autoSave: true,
        showTips: true,
        language: 'th',
        theme: 'system'
      };
      saveSettings(defaultSettings);
    }
  };

  const exportSettings = () => {
    const data = {
      exportDate: new Date().toISOString(),
      settings,
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakulang-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          saveSettings({ ...settings, ...data.settings });
          alert('นำเข้าการตั้งค่าสำเร็จ!');
        }
      } catch (error) {
        alert('ไฟล์การตั้งค่าไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button
          type="button"
          className="btn btn-secondary btn-sm back-btn"
          onClick={onBack}
        >
          ← กลับ
        </button>
        
        <h1>⚙️ การตั้งค่า</h1>
      </div>

      <div className="settings-content">
        {/* Learning Settings */}
        <div className="settings-section">
          <h2>🎓 การเรียนรู้</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">เปิดใช้พจนานุกรม</label>
              <p className="setting-description">แสดงความหมายคำเมื่อเลื่อนเมาส์ผ่าน</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableDictionary}
                onChange={(e) => handleSettingChange('enableDictionary', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">เปิดใช้คำถามที่กำหนดเอง</label>
              <p className="setting-description">รวมคำถามที่คุณสร้างเองในแบบทดสอบ</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableCustomQuestions}
                onChange={(e) => handleSettingChange('enableCustomQuestions', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">แสดงคำแนะนำ</label>
              <p className="setting-description">แสดงคำแนะนำการใช้งานสำหรับผู้ใช้ใหม่</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showTips}
                onChange={(e) => handleSettingChange('showTips', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Interface Settings */}
        <div className="settings-section">
          <h2>🎨 หน้าตา</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">ธีม</label>
              <p className="setting-description">เลือกธีมสีของแอปพลิเคชัน</p>
            </div>
            <ThemeSelector />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">เปิดใช้แอนิเมชัน</label>
              <p className="setting-description">แสดงเอฟเฟกต์การเคลื่อนไหว</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableAnimations}
                onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">ภาษาของแอป</label>
              <p className="setting-description">เลือกภาษาที่ใช้ในส่วนติดต่อผู้ใช้</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="setting-select"
            >
              <option value="th">🇹🇭 ไทย</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <h2>💾 ระบบ</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">บันทึกอัตโนมัติ</label>
              <p className="setting-description">บันทึกความคืบหน้าโดยอัตโนมัติ</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">เปิดใช้เสียง</label>
              <p className="setting-description">เล่นเสียงเมื่อตอบถูกหรือผิด</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableSounds}
                onChange={(e) => handleSettingChange('enableSounds', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2>📊 จัดการข้อมูล</h2>
          
          <div className="setting-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportSettings}
            >
              📤 ส่งออกการตั้งค่า
            </button>
            
            <label className="btn btn-secondary file-input-label">
              📥 นำเข้าการตั้งค่า
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                style={{ display: 'none' }}
              />
            </label>
            
            <button
              type="button"
              className="btn btn-danger"
              onClick={resetSettings}
            >
              🔄 รีเซ็ตการตั้งค่า
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h2>ℹ️ เกี่ยวกับ</h2>
          
          <div className="about-info">
            <div className="app-info">
              <h3>🎌 SAKULANG</h3>
              <p>แพลตฟอร์มเรียนภาษาฟรี</p>
              <p>เวอร์ชัน 2.0</p>
            </div>
            
            <div className="links">
              <a href="#" className="link-btn">📚 คู่มือการใช้งาน</a>
              <a href="#" className="link-btn">🐛 รายงานปัญหา</a>
              <a href="#" className="link-btn">💝 สนับสนุนโครงการ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;