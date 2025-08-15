# Requirements Document

## Introduction

This feature implements an enhanced Entry Splash screen for the SAKULANG application that provides visual feedback during app initialization with logo, spinner, progress bar, status messages, and offline indicator. The splash screen serves as a loading interface that keeps users informed about the app's initialization progress while maintaining accessibility and responsive design principles.

## Requirements

### Requirement 1

**User Story:** As a user launching the SAKULANG app, I want to see a visually appealing splash screen with clear progress indication, so that I understand the app is loading and know the current status.

#### Acceptance Criteria

1. WHEN the app starts THEN the system SHALL display a splash screen with logo, spinner, and progress bar
2. WHEN initialization progresses THEN the system SHALL update the progress bar from 0% to 100% with corresponding status messages
3. WHEN the app stage changes from 'boot' to 'first|locked|ready' THEN the system SHALL fade out the splash screen
4. WHEN the splash is visible THEN the system SHALL prevent background scrolling and clicking

### Requirement 2

**User Story:** As a user, I want to see detailed status messages during app loading, so that I know what the system is currently doing.

#### Acceptance Criteria

1. WHEN progress reaches 12% THEN the system SHALL display "กำลังเตรียมระบบ…" message
2. WHEN progress reaches 28% THEN the system SHALL display "เชื่อมต่อบริการพื้นฐาน" message  
3. WHEN progress reaches 56% THEN the system SHALL display "อ่านคอนฟิก/ตรวจ first-run" message
4. WHEN progress reaches 86% THEN the system SHALL display "เตรียม onboarding" message (when first-run)
5. WHEN progress reaches 92% THEN the system SHALL display "ตรวจสถานะปลดล็อก" message
6. WHEN progress reaches 100% THEN the system SHALL initiate fade out transition

### Requirement 3

**User Story:** As a user, I want to know when the app is offline, so that I can understand connectivity limitations.

#### Acceptance Criteria

1. WHEN navigator.onLine is false THEN the system SHALL display "· ออฟไลน์" badge
2. WHEN network status changes THEN the system SHALL update the offline/online status immediately without page reload
3. WHEN online THEN the system SHALL hide the offline badge
4. WHEN offline badge is shown THEN the system SHALL position it appropriately within the splash layout

### Requirement 4

**User Story:** As a user with motion sensitivity preferences, I want reduced animations, so that the interface is comfortable for me to use.

#### Acceptance Criteria

1. WHEN user has prefers-reduced-motion enabled THEN the system SHALL respect this setting for all animations
2. WHEN reduced motion is preferred THEN the system SHALL use minimal or no spinner animation
3. WHEN reduced motion is preferred THEN the system SHALL use fade transitions instead of complex animations
4. WHEN reduced motion is preferred THEN the system SHALL maintain progress indication without distracting motion

### Requirement 5

**User Story:** As a user on different screen sizes, I want the splash screen to work properly on my device, so that I have a consistent experience.

#### Acceptance Criteria

1. WHEN viewed on small screens THEN the system SHALL display all elements appropriately sized and positioned
2. WHEN viewed on large screens THEN the system SHALL center content and maintain proper proportions
3. WHEN screen orientation changes THEN the system SHALL adapt layout accordingly
4. WHEN splash is displayed THEN the system SHALL prevent viewport scrolling on all screen sizes

### Requirement 6

**User Story:** As a developer, I want the splash component to integrate seamlessly with the existing app architecture, so that it works reliably with the current stage management system.

#### Acceptance Criteria

1. WHEN App.tsx stage is 'boot' THEN the system SHALL show the splash screen
2. WHEN App.tsx stage changes to 'first', 'locked', or 'ready' THEN the system SHALL hide the splash screen
3. WHEN splash component mounts THEN the system SHALL initialize progress tracking
4. WHEN splash component unmounts THEN the system SHALL clean up any timers or listeners
5. WHEN splash is active THEN the system SHALL not interfere with existing service initialization