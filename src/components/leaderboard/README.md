# Leaderboard Components

A comprehensive set of React components for displaying public leaderboards with rankings, user profiles, and scoring explanations.

## Components Overview

### 🏆 LeaderboardScreen
Main leaderboard interface with tabs, filtering, and user interactions.

```tsx
import { LeaderboardScreen } from './components/leaderboard';

<LeaderboardScreen
  currentUserId="user123"
  initialCategory="learning"
  initialTimeframe="weekly"
  onUserSelect={(userId) => console.log('Selected:', userId)}
/>
```

**Props:**
- `currentUserId?`: Current user ID for highlighting
- `initialCategory?`: Starting category filter
- `initialTimeframe?`: Starting timeframe filter  
- `onUserSelect?`: Callback when user is selected

### 📊 LeaderboardList
Complete leaderboard display with filtering and pagination.

```tsx
import { LeaderboardList } from './components/leaderboard';

<LeaderboardList
  leaderboard={leaderboardData}
  currentUserId="user123"
  loading={false}
  onRefresh={() => refetch()}
  onUserClick={(entry) => showProfile(entry)}
  showMetrics={true}
  maxEntries={100}
/>
```

**Props:**
- `leaderboard`: Leaderboard data object
- `currentUserId?`: Current user for highlighting
- `loading?`: Loading state
- `error?`: Error message
- `onRefresh?`: Refresh callback
- `onUserClick?`: User click handler
- `showMetrics?`: Show additional metrics
- `maxEntries?`: Maximum entries to display

### 🎯 LeaderboardTabs
Navigation between different leaderboard categories and timeframes.

```tsx
import { LeaderboardTabs } from './components/leaderboard';

<LeaderboardTabs
  activeCategory="learning"
  activeTimeframe="weekly"
  onCategoryChange={(cat) => setCategory(cat)}
  onTimeframeChange={(time) => setTimeframe(time)}
  loading={false}
/>
```

**Props:**
- `activeCategory`: Currently selected category
- `activeTimeframe`: Currently selected timeframe
- `onCategoryChange`: Category change handler
- `onTimeframeChange`: Timeframe change handler
- `loading?`: Disable interactions during loading

### 🏅 LeaderboardCard
Individual leaderboard entry display with user info and stats.

```tsx
import { LeaderboardCard } from './components/leaderboard';

<LeaderboardCard
  entry={userEntry}
  showRankChange={true}
  showMetrics={false}
  isCurrentUser={false}
  onClick={(entry) => viewProfile(entry)}
/>
```

**Props:**
- `entry`: LeaderboardEntry object
- `showRankChange?`: Show rank change indicators
- `showMetrics?`: Show additional metrics
- `isCurrentUser?`: Highlight as current user
- `onClick?`: Click handler

### 📱 LeaderboardWidget
Compact leaderboard display for dashboard or sidebar.

```tsx
import { LeaderboardWidget } from './components/leaderboard';

<LeaderboardWidget
  category="learning"
  timeframe="weekly"
  maxEntries={5}
  currentUserId="user123"
  showHeader={true}
  onViewAll={() => navigate('/leaderboard')}
  className="my-custom-class"
/>
```

**Props:**
- `category?`: Leaderboard category
- `timeframe?`: Time period
- `maxEntries?`: Number of entries to show
- `currentUserId?`: Current user ID
- `showHeader?`: Show widget header
- `onViewAll?`: View all callback
- `className?`: Additional CSS classes

### 👤 UserProfileModal
Detailed user profile view from leaderboard.

```tsx
import { UserProfileModal } from './components/leaderboard';

<UserProfileModal
  user={selectedUser}
  onClose={() => setShowModal(false)}
  currentUserId="user123"
/>
```

**Props:**
- `user`: LeaderboardEntry object
- `onClose`: Close modal callback
- `currentUserId?`: Current user ID

### 🧮 ScoringExplanationModal
"อธิบายวิธีคิดคะแนน" modal with detailed scoring breakdown.

```tsx
import { ScoringExplanationModal } from './components/leaderboard';

<ScoringExplanationModal
  isOpen={showScoring}
  onClose={() => setShowScoring(false)}
  category="learning"
/>
```

**Props:**
- `isOpen`: Modal visibility state
- `onClose`: Close modal callback
- `category?`: Category for specific scoring info

## Data Types

### LeaderboardEntry
```tsx
interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  points: number;
  rank: number;
  change?: number; // Rank change from previous period
  metrics?: Record<string, number | string>;
  isCurrentUser?: boolean;
}
```

### Leaderboard
```tsx
interface Leaderboard {
  id: string;
  name: string;
  category: SuccessCategory;
  timeframe: string;
  description?: string;
  lastUpdated: string;
  entries: LeaderboardEntry[];
}
```

### SuccessCategory
```tsx
type SuccessCategory = 'learning' | 'focus' | 'streak' | 'achievement' | 'social';
```

## Features

### 🎨 Visual Design
- **Light Theme**: Clean white-blue minimal design
- **Top 3 Highlights**: Special styling for podium positions
- **Rank Icons**: 🥇🥈🥉 for top 3, numbers for others
- **Current User**: Blue highlighting for logged-in user
- **Animations**: Smooth transitions and hover effects

### 📱 Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for medium screens
- **Desktop**: Full feature set on large screens
- **Touch Friendly**: 44px minimum touch targets

### ♿ Accessibility
- **WCAG Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respects user preferences

### 🔄 Real-time Updates
- **Auto Refresh**: Updates every 5 minutes
- **Manual Refresh**: User-triggered updates
- **Loading States**: Skeleton screens during loading
- **Error Handling**: Graceful error recovery

### 🏆 Scoring System
- **Base Points**: Different actions have base point values
- **Multipliers**: Difficulty, streaks, and bonuses
- **Transparency**: Detailed scoring explanations
- **Fair Play**: Monitoring for unusual patterns

## Usage Examples

### Basic Leaderboard Page
```tsx
import React from 'react';
import { LeaderboardScreen } from './components/leaderboard';

export const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <LeaderboardScreen
        currentUserId="current-user-id"
        initialCategory="learning"
        initialTimeframe="weekly"
      />
    </div>
  );
};
```

### Dashboard Widget
```tsx
import React from 'react';
import { LeaderboardWidget } from './components/leaderboard';

export const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LeaderboardWidget
        category="learning"
        timeframe="weekly"
        maxEntries={5}
        currentUserId="user123"
        onViewAll={() => navigate('/leaderboard')}
        className="col-span-1"
      />
      {/* Other dashboard widgets */}
    </div>
  );
};
```

### Custom Leaderboard
```tsx
import React, { useState } from 'react';
import { 
  LeaderboardTabs, 
  LeaderboardList,
  ScoringExplanationModal 
} from './components/leaderboard';

export const CustomLeaderboard = () => {
  const [category, setCategory] = useState('learning');
  const [timeframe, setTimeframe] = useState('weekly');
  const [showScoring, setShowScoring] = useState(false);

  return (
    <div className="space-y-6">
      <LeaderboardTabs
        activeCategory={category}
        activeTimeframe={timeframe}
        onCategoryChange={setCategory}
        onTimeframeChange={setTimeframe}
      />
      
      <LeaderboardList
        leaderboard={leaderboardData}
        currentUserId="user123"
        showMetrics={true}
      />
      
      <button onClick={() => setShowScoring(true)}>
        อธิบายวิธีคิดคะแนน
      </button>
      
      <ScoringExplanationModal
        isOpen={showScoring}
        onClose={() => setShowScoring(false)}
        category={category}
      />
    </div>
  );
};
```

## Styling

### CSS Classes
The components use Tailwind CSS classes with custom CSS for animations:

```css
/* Import the leaderboard styles */
@import './components/leaderboard/leaderboard.css';
```

### Custom Styling
```tsx
<LeaderboardWidget
  className="my-custom-widget shadow-lg border-2 border-blue-200"
/>
```

## Testing

### Unit Tests
```bash
npm test LeaderboardComponents.test.tsx
```

### Integration Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaderboardScreen } from './components/leaderboard';

test('displays leaderboard entries', async () => {
  render(<LeaderboardScreen />);
  
  await waitFor(() => {
    expect(screen.getByText('User One')).toBeInTheDocument();
  });
});
```

## Performance

### Optimization Features
- **Lazy Loading**: Components load on demand
- **Memoization**: React.memo for expensive renders
- **Virtual Scrolling**: For large leaderboards
- **Image Optimization**: Avatar loading and caching
- **Bundle Splitting**: Separate chunks for leaderboard

### Best Practices
- Use `maxEntries` to limit data
- Implement proper loading states
- Cache leaderboard data appropriately
- Debounce search and filter inputs

## Privacy & Security

### Privacy Protection
- **Anonymous Mode**: Option to hide real names
- **Data Minimization**: Only show necessary information
- **Consent**: User opt-in for public display
- **Right to be Forgotten**: Remove user data on request

### Security Measures
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse
- **CSRF Protection**: Secure form submissions
- **XSS Prevention**: Escape user-generated content

## Internationalization

### Supported Languages
- **Thai**: Primary language (ไทย)
- **English**: Secondary language
- **Japanese**: For Japanese learning content

### Usage
```tsx
import { useTranslation } from '../hooks/useTranslation';

const { t } = useTranslation();

<h1>{t('leaderboard.title')}</h1>
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Write comprehensive tests
- Document all props and functions
- Use semantic HTML elements

### Pull Request Process
1. Create feature branch
2. Write tests for new functionality
3. Update documentation
4. Submit pull request
5. Code review and approval

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For questions or issues:
- 📧 Email: support@sakudojo.com
- 💬 Chat: Use the help button in the app
- 📚 Docs: https://docs.sakudojo.com
- 🐛 Issues: https://github.com/sakudojo/issues