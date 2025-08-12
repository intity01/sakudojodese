# Implementation Plan

- [x] 1. Set up project structure and core interfaces



  - Create TypeScript interfaces for Question types (MCQ, Typing, Open)
  - Define Track, Framework, Mode, and ProgressEntry types
  - Implement utility functions (normalize, shuffle, uid generation)
  - Set up framework level mappings and track-framework relationships
  - _Requirements: 1.1, 1.2, 2.1, 2.2_



- [ ] 2. Implement core Dojo Engine functionality
  - [ ] 2.1 Create session management system
    - Write DojoEngine class with session state management
    - Implement startSession method with question pool generation
    - Add session progress tracking (current question, score, total)
    - Create unit tests for session initialization and state management
    - _Requirements: 2.3, 3.1, 3.7_

  - [ ] 2.2 Implement question answering logic
    - Write answerMCQ method with choice validation
    - Implement answerTyping method with normalized string matching
    - Add answerOpen method for open-ended questions (no auto-grading)
    - Create scoring and feedback mechanisms
    - Write unit tests for answer validation and scoring
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 2.3 Add session navigation and control
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
  - [ ] 4.1 Create Quiz mode implementation
    - Implement quiz session with limited question count (6-14 questions)
    - Add auto-grading and immediate feedback
    - Create progress recording for completed quizzes
    - Write unit tests for quiz mode functionality
    - _Requirements: 3.2, 3.7_

  - [ ] 4.2 Implement Study mode
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
  - [ ] 8.1 Create main application layout
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

- [ ] 12. Integration testing and final polish
  - [ ] 12.1 Create comprehensive integration tests
    - Write end-to-end tests for complete learning workflows
    - Test cross-browser compatibility for storage and UI
    - Implement automated testing for all user scenarios
    - Create test data and mock services for consistent testing
    - _Requirements: All requirements integration testing_

  - [ ] 12.2 Final optimization and deployment preparation
    - Optimize final bundle size and loading performance
    - Implement service worker for offline functionality
    - Create build configuration and deployment scripts
    - Add monitoring and analytics infrastructure
    - Write deployment documentation and user guides
    - _Requirements: 8.1, 8.2, 8.3, 8.4_