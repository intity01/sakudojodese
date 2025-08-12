# Requirements Document

## Introduction

Saku Dojo v2 is a comprehensive language learning application that supports both English and Japanese learning through structured curricula (CEFR for English, JLPT for Japanese). The application provides multiple learning modes including quizzes, study sessions, exams, reading/translation exercises, and writing practice. It features a custom question builder, daily challenges, and integrated dictionary lookup functionality through SakuLex. The system aims to provide clear learning paths with responsive practice exercises and reliable vocabulary resources in a single interface.

## Requirements

### Requirement 1: Multi-Language Track Support

**User Story:** As a language learner, I want to choose between English and Japanese learning tracks, so that I can focus on my target language with appropriate curriculum frameworks.

#### Acceptance Criteria

1. WHEN the user opens the application THEN the system SHALL present track selection options for English and Japanese
2. WHEN the user selects English track THEN the system SHALL provide CEFR curriculum levels (A1-C2)
3. WHEN the user selects Japanese track THEN the system SHALL provide JLPT curriculum levels (N5-N1)
4. WHEN the user switches between tracks THEN the system SHALL preserve progress data for each track separately
5. IF the user has not selected a track THEN the system SHALL not allow access to learning modes

### Requirement 2: Curriculum and Level Management

**User Story:** As a language learner, I want to select appropriate curriculum levels based on my proficiency, so that I can practice at the right difficulty level.

#### Acceptance Criteria

1. WHEN the user selects a track THEN the system SHALL display available curricula (Classic, CEFR for EN, JLPT for JP)
2. WHEN the user selects a curriculum THEN the system SHALL show appropriate levels for that curriculum
3. WHEN the user changes curriculum or level THEN the system SHALL refresh the question pool immediately
4. IF the user selects Classic curriculum THEN the system SHALL provide Beginner to Expert levels
5. WHEN the user completes a level THEN the system SHALL unlock the next level in sequence

### Requirement 3: Multiple Learning Modes

**User Story:** As a language learner, I want access to different learning modes, so that I can practice various skills and learning approaches.

#### Acceptance Criteria

1. WHEN the user selects a level THEN the system SHALL provide access to Quiz, Study, Exam, Read/Translate, and Write modes
2. WHEN the user enters Quiz mode THEN the system SHALL present MCQ and typing questions with auto-grading
3. WHEN the user enters Study mode THEN the system SHALL display questions with immediate answer explanations
4. WHEN the user enters Exam mode THEN the system SHALL randomly select 20 questions across levels within the current curriculum
5. WHEN the user enters Read/Translate mode THEN the system SHALL provide open-ended exercises with sample answers
6. WHEN the user enters Write mode THEN the system SHALL provide writing prompts with rubric-based evaluation
7. WHEN the user completes a Quiz or Exam session THEN the system SHALL record progress data (score percentage, total questions, correct answers)

### Requirement 4: Custom Question Builder

**User Story:** As a language learner or educator, I want to create custom questions, so that I can practice specific content or supplement existing materials.

#### Acceptance Criteria

1. WHEN the user accesses the Custom Builder THEN the system SHALL provide forms for creating MCQ, typing, and open-ended questions
2. WHEN the user creates a question THEN the system SHALL require tagging with Track, Curriculum, and Level
3. WHEN the user saves a custom question THEN the system SHALL store it in the appropriate question pool
4. WHEN the user selects a mode THEN the system SHALL include relevant custom questions in the question pool
5. IF a custom question lacks required tags THEN the system SHALL prevent saving and display validation errors

### Requirement 5: Daily Challenge System

**User Story:** As a language learner, I want a daily challenge with a fixed number of questions, so that I can maintain consistent practice habits.

#### Acceptance Criteria

1. WHEN the user accesses Daily Challenge THEN the system SHALL present exactly 10 questions
2. WHEN generating daily questions THEN the system SHALL randomly select from the user's current curriculum pool
3. WHEN the user completes the Daily Challenge THEN the system SHALL record the score like a regular Quiz session
4. WHEN the user has already completed the daily challenge THEN the system SHALL display completion status and score
5. IF no questions are available for the current curriculum THEN the system SHALL display an appropriate message

### Requirement 6: Dictionary Integration (SakuLex)

**User Story:** As a language learner, I want to quickly look up words while practicing, so that I can understand unfamiliar vocabulary without interrupting my learning flow.

#### Acceptance Criteria

1. WHEN the user hovers over a word in questions or choices THEN the system SHALL display a tooltip with dictionary information within 150ms
2. WHEN displaying dictionary information THEN the system SHALL show gloss, reading (for Japanese), and frequency data when available
3. WHEN the dictionary feature is disabled THEN the system SHALL hide hover functionality
4. IF a word is not found in the dictionary THEN the system SHALL display "No definition found" message
5. WHEN the tooltip appears THEN the system SHALL not obstruct the question content

### Requirement 7: Progress Tracking and Export

**User Story:** As a language learner, I want to track my progress and export my data, so that I can monitor improvement and backup my learning history.

#### Acceptance Criteria

1. WHEN the user completes a Quiz or Exam THEN the system SHALL store progress entry with date, track, level, score percentage, total questions, and correct answers
2. WHEN the user accesses progress view THEN the system SHALL display historical performance data
3. WHEN the user requests data export THEN the system SHALL generate JSON file with all progress and custom questions
4. WHEN the user imports data THEN the system SHALL merge with existing data without duplicates
5. IF localStorage is unavailable THEN the system SHALL display warning about data persistence

### Requirement 8: Performance and User Experience

**User Story:** As a language learner, I want a responsive and fast application, so that I can focus on learning without technical distractions.

#### Acceptance Criteria

1. WHEN the user first loads the application THEN the system SHALL achieve first interaction within 1 second on mid-range devices
2. WHEN the application loads THEN the total bundle size SHALL be less than 200KB (excluding data files)
3. WHEN the user switches between modes or levels THEN the system SHALL update the interface within 300ms
4. WHEN the user answers questions THEN the system SHALL provide immediate feedback without noticeable delay
5. IF the application encounters errors THEN the system SHALL display user-friendly error messages with recovery options

### Requirement 9: Data Management and Licensing

**User Story:** As a user and developer, I want clear data licensing and attribution, so that I can understand usage rights and contribute to open-source learning resources.

#### Acceptance Criteria

1. WHEN the application uses external data sources THEN the system SHALL maintain separate licensing for code (MIT/Apache) and data (CC BY-SA/CC BY/CC0)
2. WHEN displaying content from external sources THEN the system SHALL provide proper attribution
3. WHEN the user accesses attribution information THEN the system SHALL display ATTRIBUTION.md with source links and licenses
4. WHEN loading dictionary data THEN the system SHALL fetch from external sources to maintain licensing separation
5. IF attribution data is missing THEN the system SHALL prevent using the associated content

### Requirement 10: Local Storage and Data Persistence

**User Story:** As a language learner, I want my progress and custom content saved locally, so that I can continue learning across sessions without losing data.

#### Acceptance Criteria

1. WHEN the user creates progress or custom content THEN the system SHALL store data in localStorage
2. WHEN the user returns to the application THEN the system SHALL restore previous session state including track, curriculum, and level selections
3. WHEN localStorage reaches capacity THEN the system SHALL implement data cleanup strategy prioritizing recent progress
4. WHEN the user clears browser data THEN the system SHALL provide export functionality to backup important data
5. IF localStorage is corrupted THEN the system SHALL reset to default state and notify the user