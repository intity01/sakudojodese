# Design Document

## Overview

The Entry Splash component provides a comprehensive loading experience for the SAKULANG application with visual feedback including logo, spinner, progress bar, status messages, and network connectivity indicator. The component integrates with the existing App.tsx architecture by introducing a new 'boot' stage that precedes the current 'start' state, ensuring seamless initialization flow.

## Architecture

### Component Structure
```
App.tsx (Modified)
├── stage: 'boot' | 'start' | 'quiz' | 'result' | 'progress' | 'settings'
├── Splash.tsx (New)
│   ├── Logo Display
│   ├── Spinner Animation
│   ├── Progress Bar (0-100%)
│   ├── Status Messages
│   ├── Offline Badge
│   └── Fade Transition
└── Existing Components (unchanged)
```

### State Management
- **App Stage**: Extended to include 'boot' stage before 'start'
- **Progress Tracking**: Internal state for progress percentage and status messages
- **Network Status**: Real-time online/offline detection
- **Animation State**: Manages fade transitions and reduced motion preferences

### Integration Points
- **App.tsx**: Modified to handle 'boot' stage and initialization sequence
- **index.css**: Extended with splash-specific styles
- **Service Workers**: Coordinated initialization timing
- **Theme System**: Respects existing theme context

## Components and Interfaces

### Splash Component Interface
```typescript
interface SplashProps {
  onComplete: () => void;
}

interface SplashState {
  progress: number;
  statusMessage: string;
  isOnline: boolean;
  isVisible: boolean;
}
```

### Progress Mapping
```typescript
const PROGRESS_STAGES = {
  INIT: { progress: 12, message: 'กำลังเตรียมระบบ…' },
  SERVICES: { progress: 28, message: 'เชื่อมต่อบริการพื้นฐาน' },
  CONFIG: { progress: 56, message: 'อ่านคอนฟิก/ตรวจ first-run' },
  ONBOARDING: { progress: 86, message: 'เตรียม onboarding' },
  UNLOCK: { progress: 92, message: 'ตรวจสถานะปลดล็อก' },
  COMPLETE: { progress: 100, message: 'เสร็จสิ้น' }
};
```

### App State Extension
```typescript
type AppStage = 'boot' | 'start' | 'quiz' | 'result' | 'progress' | 'settings';
```

## Data Models

### Progress State Model
```typescript
interface ProgressState {
  current: number;        // 0-100
  stage: keyof typeof PROGRESS_STAGES;
  message: string;
  timestamp: number;
}
```

### Network State Model
```typescript
interface NetworkState {
  isOnline: boolean;
  lastChanged: number;
  connectionType?: string;
}
```

### Animation State Model
```typescript
interface AnimationState {
  prefersReducedMotion: boolean;
  fadeProgress: number;   // 0-1
  isTransitioning: boolean;
}
```

## Error Handling

### Network Detection Fallbacks
- Primary: `navigator.onLine` API
- Fallback: Timeout-based detection if API unavailable
- Graceful degradation: Hide offline badge if detection fails

### Progress Simulation Errors
- Minimum progress guarantees to prevent UI freezing
- Timeout fallbacks for each initialization stage
- Maximum initialization time limit (10 seconds)

### Animation Failures
- CSS animation fallbacks for older browsers
- Reduced motion compliance with system preferences
- Progressive enhancement approach

### Integration Errors
- Safe fallback to 'start' stage if boot fails
- Error boundary protection for splash component
- Logging for debugging initialization issues

## Testing Strategy

### Unit Tests
```typescript
// Splash.test.tsx
describe('Splash Component', () => {
  test('renders logo and initial progress');
  test('updates progress through stages');
  test('shows offline badge when offline');
  test('respects reduced motion preferences');
  test('calls onComplete when finished');
  test('handles network status changes');
});
```

### Integration Tests
```typescript
// App.integration.test.tsx
describe('App Boot Sequence', () => {
  test('starts in boot stage');
  test('transitions from boot to start');
  test('initializes services during boot');
  test('handles boot stage errors gracefully');
});
```

### Visual Tests
- Progress bar animation smoothness
- Fade transition timing
- Responsive layout on different screen sizes
- Theme compatibility (light/dark modes)
- Accessibility compliance (screen readers, keyboard navigation)

### Performance Tests
- Initialization timing benchmarks
- Memory usage during splash display
- Animation performance on low-end devices
- Network status detection responsiveness

## Implementation Details

### CSS Architecture
```css
/* Splash-specific styles in index.css */
.splash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: var(--background-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.splash-content {
  text-align: center;
  max-width: 400px;
  padding: var(--space-6);
}

.splash-logo {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-8);
}

.splash-progress {
  width: 100%;
  margin: var(--space-6) 0;
}

.splash-status {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  margin-top: var(--space-4);
}

.splash-offline {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: var(--warning);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  font-size: var(--font-size-xs);
}

/* Animations */
.splash-spinner {
  animation: spin 2s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .splash-spinner {
    animation: none;
  }
}

.splash-fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

### Service Integration
- **Analytics**: Track splash display duration and completion
- **Auth**: Initialize guest login during splash
- **Notifications**: Request permissions during splash
- **Service Worker**: Coordinate with SW registration

### Accessibility Features
- Screen reader announcements for progress updates
- High contrast mode support
- Keyboard navigation (though limited interaction)
- Focus management during transitions
- ARIA labels for progress indicators

### Performance Optimizations
- CSS-only animations where possible
- Minimal JavaScript execution during splash
- Preload critical resources
- Efficient progress calculation
- Memory cleanup on component unmount