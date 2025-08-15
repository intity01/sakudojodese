// Quick Add Component - Kiro Spec Compliant
// รูปแบบ: TITLE DURATION WHEN [TIME] [#TAGS] [!PRIORITY] [@ENERGY] [dep:ID|->ID] [by DATE|by weekday|within X days]

import React, { useState, useRef, useEffect } from 'react';
import { parseThaiQuickAdd, ParsedTask } from '../utils/thaiTimeParser';

interface QuickAddProps {
  onAdd: (task: ParsedTask) => void;
  placeholder?: string;
}

const QuickAdd: React.FC<QuickAddProps> = ({ 
  onAdd, 
  placeholder = "อ่านอัลกอ 30m พรุ่งนี้ 9:00 #study !high @medium" 
}) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ParsedTask | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse input in real-time
  useEffect(() => {
    if (input.trim()) {
      try {
        const parsed = parseThaiQuickAdd(input);
        setPreview(parsed);
      } catch (error) {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && preview) {
      onAdd(preview);
      setInput('');
      setPreview(null);
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInput('');
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'วันนี้';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'พรุ่งนี้';
    } else {
      return date.toLocaleDateString('th-TH', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}นาที`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}ชม ${mins}นาที` : `${hours}ชม`;
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          position: 'relative',
          backgroundColor: 'var(--surface)',
          border: '2px solid',
          borderColor: isExpanded ? 'var(--pri-500)' : 'var(--border)',
          borderRadius: 'var(--radius-lg)',
          transition: 'all 0.2s ease'
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--fg-0)',
              fontFamily: 'var(--font-family)'
            }}
          />
          
          {/* Add Button */}
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.5rem',
              backgroundColor: input.trim() ? 'var(--pri-500)' : 'var(--border)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            ➕
          </button>
        </div>
      </form>

      {/* Preview */}
      {preview && isExpanded && (
        <div style={{
          marginTop: '0.5rem',
          padding: '1rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          color: 'var(--fg-muted)'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--fg-0)' }}>
              {preview.title}
            </strong>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {/* Duration */}
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--pri-500)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem'
            }}>
              ⏱️ {formatDuration(preview.duration)}
            </span>

            {/* Date & Time */}
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--info)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem'
            }}>
              📅 {formatDate(preview.date)}
              {preview.time && ` ${preview.time}`}
            </span>

            {/* Priority */}
            {preview.priority && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: preview.priority === 'high' ? 'var(--danger-500)' : 
                                preview.priority === 'medium' ? 'var(--warn-500)' : 
                                'var(--success)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem'
              }}>
                ❗ {preview.priority}
              </span>
            )}

            {/* Energy */}
            {preview.energy && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--fg-0)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem'
              }}>
                ⚡ {preview.energy}
              </span>
            )}

            {/* Tags */}
            {preview.tags.map(tag => (
              <span key={tag} style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--fg-0)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem'
              }}>
                #{tag}
              </span>
            ))}

            {/* Dependencies */}
            {preview.dependencies && preview.dependencies.length > 0 && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--fg-0)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem'
              }}>
                🔗 {preview.dependencies.join(', ')}
              </span>
            )}

            {/* Deadline */}
            {preview.deadline && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--warn-500)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem'
              }}>
                ⏰ {formatDate(preview.deadline)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      {isExpanded && !input && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: 'var(--fg-muted)',
          lineHeight: '1.4'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--fg-0)' }}>
            รูปแบบ Quick Add:
          </div>
          <div>
            <strong>TITLE DURATION WHEN [TIME] [#TAGS] [!PRIORITY] [@ENERGY]</strong>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            ตัวอย่าง: "อ่านหนังสือ 30m พรุ่งนี้เช้า #study !high @medium"
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAdd;