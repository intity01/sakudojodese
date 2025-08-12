# 🎌 Saku Dojo v2 - Language Learning Platform

A modern, mobile-friendly language learning application for English and Japanese with support for CEFR and JLPT curricula.

## ✨ Features

- 🌍 **Multi-Language Support**: English and Japanese
- 📚 **Multiple Frameworks**: Classic, CEFR, and JLPT curricula
- 🎯 **Question Types**: Multiple choice, typing, and open-ended questions
- 📱 **Mobile-First Design**: Responsive and touch-friendly interface
- 💾 **Offline Support**: Progressive Web App (PWA) with offline functionality
- 📊 **Progress Tracking**: Detailed statistics and learning history
- 🎮 **Multiple Modes**: Quiz, Study, Exam, Read, and Write modes
- 🔄 **Auto-Save**: Progress automatically saved to local storage

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo

```bash
# Run the command-line demo
npm run demo
```

## 📱 Mobile Installation

### Android
1. Open the app in Chrome
2. Tap the menu (⋮) and select "Add to Home screen"
3. Confirm installation

### iOS
1. Open the app in Safari
2. Tap the Share button (□↗)
3. Select "Add to Home Screen"
4. Confirm installation

## 🌐 Free Deployment Options

### Option 1: Netlify (Recommended)
1. Fork this repository
2. Connect your GitHub account to [Netlify](https://netlify.com)
3. Deploy directly from GitHub
4. Automatic deployments on every push

```bash
# Or deploy manually
npm run deploy:netlify
```

### Option 2: Vercel
1. Connect your GitHub account to [Vercel](https://vercel.com)
2. Import your repository
3. Deploy with zero configuration

```bash
# Or deploy manually
npm run deploy:vercel
```

### Option 3: GitHub Pages
1. Enable GitHub Pages in repository settings
2. Use GitHub Actions for automatic deployment
3. Free hosting with custom domain support

### Option 4: Surge.sh
```bash
# Quick deployment
npm run deploy:surge
```

## 🏗️ Architecture

### Core Components
- **DojoEngine**: Main learning session management
- **Question Types**: MCQ, Typing, and Open-ended questions
- **Progress Tracking**: Local storage with export capabilities
- **PWA Features**: Service worker, offline support, installable

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest
- **Styling**: Custom CSS with CSS Variables
- **PWA**: Service Worker + Web App Manifest

## 📊 Question Bank Structure

```typescript
QuestionBank = {
  [Language]: {
    [Framework]: {
      [Level]: Question[]
    }
  }
}
```

### Supported Configurations
- **Languages**: EN (English), JP (Japanese)
- **Frameworks**: Classic, CEFR, JLPT
- **Levels**: 
  - Classic: Beginner, Intermediate, Advanced
  - CEFR: A1, A2, B1, B2, C1, C2
  - JLPT: N5, N4, N3, N2, N1

## 🎯 Question Types

### Multiple Choice (MCQ)
```typescript
{
  id: string;
  type: "mcq";
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
}
```

### Typing Questions
```typescript
{
  id: string;
  type: "typing";
  prompt: string;
  accept: string[];
  placeholder?: string;
  explanation?: string;
}
```

### Open-Ended Questions
```typescript
{
  id: string;
  type: "open";
  prompt: string;
  explanation?: string;
  rubric?: string[];
}
```

## 📈 Progress Tracking

All progress is automatically saved to browser local storage:
- Session results with timestamps
- Score percentages and detailed breakdowns
- Learning streaks and achievements
- Export/import functionality for data portability

## 🔧 Customization

### Adding New Questions
1. Edit the question bank in `demo.ts` or create your own
2. Follow the TypeScript interfaces for type safety
3. Questions support multiple languages and explanations

### Styling
- CSS variables in `src/index.css` for easy theming
- Mobile-first responsive design
- Dark mode support (coming soon)

### Features
- Extend the `DojoEngine` class for new functionality
- Add new question types by implementing the `Question` interface
- Create custom progress tracking and analytics

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎯 Roadmap

- [ ] Dark mode support
- [ ] Audio pronunciation features
- [ ] Spaced repetition algorithm
- [ ] Social features and leaderboards
- [ ] Advanced analytics dashboard
- [ ] Custom question creation interface
- [ ] Multi-user support with cloud sync
- [ ] Gamification elements

## 🤝 Support

- 📧 Create an issue for bug reports
- 💡 Feature requests welcome
- 🌟 Star the repository if you find it useful
- 🔄 Share with other language learners

---

Made with ❤️ for language learners worldwide