# Implementation Plan

- [x] 1. Set up project structure and core interfaces



  - Create TypeScript interfaces for Question types (MCQ, Typing, Open)
  - Define Track, Framework, Mode, and ProgressEntry types
  - Implement utility functions (normalize, shuffle, uid generation)
  - Set up framework level mappings and track-framework relationships
  - _Requirements: 1.1, 1.2, 2.1, 2.2_



- [ ] 2. Implement core Dojo Engine functionality
  - [x] 2.1 Create session management system



    - Write DojoEngine class with session state management
    - Implement startSession method with question pool generation
    - Add session progress tracking (current question, score, total)
    - Create unit tests for session initialization and state management



    - _Requirements: 2.3, 3.1, 3.7_

  - [x] 2.2 Implement question answering logic



    - Write answerMCQ method with choice validation
    - Implement answerTyping method with normalized string matching
    - Add answerOpen method for open-ended questions (no auto-grading)
    - Create scoring and feedback mechanisms
    - Write unit tests for answer validation and scoring

    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 2.3 Add session navigation and control





    - Implement nextQuestion, previousQuestion, and skipQuestion methods
    - Add session completion logic with progress entry generation



    - Create session reset functionality
    - Write unit tests for navigation and session lifecycle
    - _Requirements: 3.2, 3.7_









- [ ] 3. Create question bank management system
  - [ ] 3.1 Implement static question banks
    - Create question bank data structure organized by Track/Framework/Level
    - Populate initial question sets for EN Classic, EN CEFR, JP Classic, JP JLPT


    - Implement question filtering and selection logic
    - Write unit tests for question bank access and filtering
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

  - [ ] 3.2 Add custom question builder functionality
    - Create CustomQuestion interface with tagging metadata
    - Implement custom question creation, validation, and storage
    - Add custom question filtering by track/framework/level
    - Integrate custom questions with existing question pools
    - Write unit tests for custom question management
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Implement learning modes
  - [x] 4.1 Create Quiz mode implementation


    - Implement quiz session with limited question count (6-14 questions)
    - Add auto-grading and immediate feedback
    - Create progress recording for completed quizzes
    - Write unit tests for quiz mode functionality
    - _Requirements: 3.2, 3.7_




  - [x] 4.2 Implement Study mode


    - Create study session showing all questions with immediate answers
    - Add explanation display for each question
    - Implement navigation through study materials
    - Write unit tests for study mode behavior
    - _Requirements: 3.3_

  - [ ] 4.3 Add Exam mode functionality
    - Implement cross-level question selection within curriculum
    - Create 20-question exam sessions with random selection
    - Add exam scoring and progress recording
    - Write unit tests for exam question selection and scoring
    - _Requirements: 3.4, 3.7_

  - [ ] 4.4 Create Read/Translate and Write modes
    - Implement open-ended question display and input handling
    - Add sample answer/rubric display functionality
    - Create non-scoring session completion (no progress recording)
    - Write unit tests for open-ended mode behavior
    - _Requirements: 3.5, 3.6_

- [ ] 5. Build Daily Challenge system
  - [ ] 5.1 Implement daily challenge logic
    - Create daily challenge session with exactly 10 questions
    - Implement random question selection from current curriculum
    - Add daily completion tracking and status display
    - Write unit tests for daily challenge generation and tracking
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Create progress tracking and storage system
  - [ ] 6.1 Implement localStorage-based progress storage
    - Create progress entry storage and retrieval functions
    - Implement data serialization and deserialization
    - Add error handling for storage unavailability
    - Write unit tests for storage operations
    - _Requirements: 7.1, 7.4, 10.1, 10.2, 10.5_

  - [ ] 6.2 Add progress visualization and export
    - Implement progress history display with sparkline charts
    - Create JSON export functionality for user data
    - Add data import functionality with duplicate handling
    - Write unit tests for data export/import operations
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 7. Implement SakuLex dictionary integration
  - [ ] 7.1 Create basic SakuLex interface and data structures
    - Define Lexeme interface and dictionary data types
    - Implement basic lookup and search functionality
    - Create text normalization and tokenization utilities
    - Write unit tests for dictionary operations
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 7.2 Add hover tooltip functionality
    - Implement word detection and hover event handling
    - Create tooltip component with dictionary information display
    - Add 150ms response time optimization with caching
    - Implement feature flag for dictionary enable/disable
    - Write unit tests for tooltip behavior and performance
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 8. Build React UI components
  - [x] 8.1 Create main application layout




    - Implement header with title, controls, and export functionality
    - Create track/framework/level selection interface
    - Add mode selection controls with custom question toggle
    - Write component tests for layout and navigation
    - _Requirements: 1.1, 1.4, 2.1, 2.3, 2.4_

  - [ ] 8.2 Implement question display components
    - Create MCQ question component with choice buttons
    - Implement typing question component with input validation
    - Add open-ended question component with text area
    - Create explanation and feedback display components
    - Write component tests for question rendering and interaction
    - _Requirements: 3.2, 3.3, 3.5, 3.6_

  - [ ] 8.3 Build progress and statistics components
    - Implement progress sparkline chart visualization
    - Create session results display component
    - Add statistics summary and historical data display
    - Write component tests for data visualization
    - _Requirements: 7.1, 7.2_

  - [ ] 8.4 Create custom question builder UI
    - Implement form components for question creation
    - Add validation and error display for form inputs
    - Create tag selection interface for track/framework/level
    - Write component tests for form validation and submission
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 9. Add error handling and user experience improvements
  - [ ] 9.1 Implement comprehensive error handling
    - Create error boundary components for React error catching
    - Add graceful degradation for missing question banks
    - Implement fallback mechanisms for storage failures
    - Write error handling tests and recovery scenarios
    - _Requirements: 8.5, 10.3, 10.4, 10.5_

  - [ ] 9.2 Optimize performance and user experience
    - Implement loading states and progress indicators
    - Add debouncing for dictionary lookups and search
    - Optimize bundle size and implement code splitting
    - Create performance monitoring and measurement tools
    - Write performance tests and benchmarks
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Implement data licensing and attribution system
  - [ ] 10.1 Create attribution and licensing infrastructure
    - Implement ATTRIBUTION.md generation with source links
    - Add license validation for external data sources
    - Create data source separation between code and content
    - Write tests for attribution and licensing compliance
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Add accessibility and internationalization features
  - [ ] 11.1 Implement accessibility compliance
    - Add ARIA labels and semantic HTML structure
    - Implement keyboard navigation for all interactive elements
    - Create focus management and screen reader support
    - Write accessibility tests and WCAG compliance validation
    - _Requirements: 8.4, 8.5_

  - [ ] 11.2 Prepare internationalization infrastructure
    - Implement proper font loading for Japanese characters
    - Add IME support for Japanese text input
    - Create RTL layout preparation for future languages
    - Write internationalization tests and character encoding validation
    - _Requirements: 1.1, 1.2_

- [ ] 12. Kiro Light — Audit & Redesign v1 (UI + Question Bank)
  - [x] 12.1 Quick Audit & Information Architecture Restructure



    - Conduct UI/UX audit: identify strengths, gaps, and areas for reorganization
    - Reduce navigation from 6 tabs to 4 tabs: Home, Plan, Focus, Learn
    - Move Quick Add to AppBar as + button, move ICS to Settings → Utilities
    - Create new Learn module for vocabulary/questions with filters (CEFR/JLPT/Tags)
    - Design Light-first theme (white-blue minimal) with Dark mode as secondary
    - _Requirements: UI audit, navigation simplification, new Learn module_

  - [x] 12.2 Light Theme Implementation (White-Blue Minimal)



    - Implement Light theme color tokens: bg/0 #F8FAFC, bg/1 #FFFFFF, pri/500 #1D4ED8
    - Create typography scale: Display 32/40/700, H1 24/32/700, Body 16/24/400
    - Add spacing system (4,8,12,16,24,32), radius (card 16, input 12), elevation
    - Implement smooth motion system: 120ms micro, 200ms standard, 240ms modal
    - Update all UI components to use Light theme tokens with proper contrast
    - _Requirements: Light theme design system, accessibility compliance_

  - [x] 12.3 Learn Module Development





    - Create Learn page with Filter bar (Language, Level, Type, Tag, Source, License)
    - Implement vocabulary/question cards with License attribution chips
    - Build Study Flow: Deck selection → Practice modes → Results & progress
    - Add practice modes: Flashcards, Multiple-choice, Dictation, Conversation prompts
    - Create question detail view with meaning, examples, audio, source/license
    - _Requirements: Learn module, study flows, license attribution_

  - [ ] 12.4 Question Bank Data Model & Schema


    - Design JSON schema for Items (vocab/grammar/reading/listening/pronunciation)
    - Implement Source entity with license, attribution, and URL tracking
    - Create Media entity for audio/images with proper license attribution
    - Add level classification: CEFR (A1-C1), JLPT heuristic (1-5), frequency bands
    - Implement scoring system based on word frequency, sentence complexity, kanji count
    - _Requirements: Data model, licensing system, difficulty classification_

  - [x] 12.5 Open Source Data Integration & ETL Pipeline



    - Set up ETL pipeline: Ingest → Normalize → Link → Level → Moderate → Version
    - Integrate EN sources: NGSL/NAWL (high-frequency & academic vocabulary)
    - Integrate JP sources: JMdict + KANJIDIC2 (meanings/readings/examples)
    - Add parallel sentences from Tatoeba (EN-JP sentence pairs)
    - Implement heuristic leveling based on frequency/length/grammar patterns
    - Create sources.json with proper attribution and license tracking
    - _Requirements: Open source integration, ETL pipeline, data curation_

  - [x] 12.6 UI Components & Accessibility



    - Implement Light-spec components: AppBar (64px/56px), TabBar, Cards, Buttons
    - Create accessible components: touch targets ≥44x44, focus rings, proper contrast
    - Add License badges (BY, BY-SA, EDRDG) with proper styling and attribution
    - Implement responsive design with mobile-first approach
    - Add bundle splitting: separate Learn module, lazy loading, prefetch on hover
    - Ensure WCAG compliance and reduced-motion support
    - _Requirements: Accessibility, performance, responsive design_

  - [x] 12.7 Starter Content & Curation



    - Create starter decks: EN Daily A1-A2 (1000 items), EN Academic B1-C1 (800 items)
    - Add JP Daily Heuristic 1-5 (1200 items) from JMdict + Tatoeba
    - Organize by topics: Travel, Work, Study, Dev, Music (200-300 items each)
    - Implement content moderation: random 5-10% batch checking, license validation
    - Create version.json for release tracking with source hashes
    - Add copywriting with light tone: encouraging, clear, transparent messaging
    - _Requirements: Content curation, starter decks, quality assurance_

- [ ] 13. Feedback Chat + Success Leaderboard System
  - [x] 13.1 Help Drawer & Chat-like Feedback Interface



    - Create floating Help button (💬) in bottom-right corner (desktop) / above TabBar (mobile)
    - Implement Feedback Drawer (~360px width) with "คุยกับ Kiro Care" header
    - Add real-time chat interface with message input, send button, and file attachment
    - Create channel selection: Default "Kiro Inbox", Email, Telegram, Messenger (multi-select)
    - Add "ดูวิธีแก้เอง" CTA linking to docs/FAQ
    - _Requirements: Real-time chat UI, channel integration, file upload_







  - [ ] 13.2 Multi-Channel Integration & Bidirectional Sync
    - Implement Telegram Bot webhook integration for receiving/sending messages
    - Add Messenger Webhook integration with Facebook Graph API
    - Create Email integration: SMTP outbound + inbound parsing or magic link replies



    - Build bidirectional message sync: team replies in external channels → sync back to Drawer
    - Add channel indicator badges under chat bubbles (e.g., "ตอบผ่าน Telegram")
    - _Requirements: Webhook integrations, message synchronization, channel routing_




  - [x] 13.3 Database Schema & API Design









    - Design chat schema: conversations, messages, participants, channels, attachments
    - Create REST API endpoints: start chat, send message, attach file, close case
    - Implement WebSocket API for real-time messaging (target latency ≤1s)
    - Add webhook endpoints for each channel (Telegram, Messenger, Email)
    - Create conversation status tracking: New/Open/Waiting/Resolved
    - _Requirements: Database design, REST/WS APIs, webhook handling_

  - [ ] 13.4 Security, Privacy & Compliance
    - Implement user consent flow before collecting contact information
    - Add rate limiting for messages and file uploads (prevent spam)
    - Create file attachment validation and virus scanning
    - Implement Content Security Policy (CSP) for chat interface
    - Add comprehensive audit logging for all chat interactions
    - _Requirements: Privacy compliance, security measures, audit trails_

  - [ ] 13.5 Success Events & Metrics System
    - Define success event types: focus sessions, quiz completions, study streaks
    - Create SuccessEvent data model with user, event type, points, timestamp
    - Implement scoring algorithm: focus minutes, questions answered, streak days
    - Add event tracking integration with existing DojoEngine and FocusScreen
    - Create daily/weekly/all-time aggregation system
    - _Requirements: Event tracking, scoring system, data aggregation_

  - [ ] 13.6 Public Leaderboard Interface
    - Create /leaderboard public page with Daily/Weekly/All-time filters
    - Implement category filters: Focus, Learn, Streak, Overall
    - Design Hero cards for Top 3 + table view for Top 100
    - Add anonymous/public name display options (protect privacy)
    - Create "อธิบายวิธีคิดคะแนน" modal with scoring explanation
    - Implement "อันดับของฉัน" personal ranking card
    - _Requirements: Public leaderboard UI, privacy protection, scoring transparency_

  - [ ] 13.7 Performance & Testing
    - Ensure WebSocket message delivery ≤1s latency
    - Implement offline message queuing and sync when reconnected
    - Create comprehensive test suite: unit tests, integration tests, load tests
    - Add monitoring for chat system health and webhook reliability
    - Test all channel integrations with real external services
    - _Requirements: Performance targets, comprehensive testing, monitoring_

- [ ] 14. Integration testing and final polish
  - [ ] 14.1 Create comprehensive integration tests
    - Write end-to-end tests for complete learning workflows
    - Test cross-browser compatibility for storage and UI
    - Implement automated testing for all user scenarios
    - Create test data and mock services for consistent testing
    - _Requirements: All requirements integration testing_

  - [ ] 14.2 Final optimization and deployment preparation
    - Optimize final bundle size and loading performance
    - Implement service worker for offline functionality
    - Create build configuration and deployment scripts
    - Add monitoring and analytics infrastructure
    - Write deployment documentation and user guides
    - _Requirements: 8.1, 8.2, 8.3, 8.4_