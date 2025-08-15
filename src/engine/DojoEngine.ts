import {
  SessionState
} from '../types/core';

import type {
  Question,
  QuestionBank,
  Track,
  Framework,
  ProgressEntry,
  SessionConfig,
  SessionProgress,
  SessionData,
  AnswerResult,
  ValidationResult,
  NavigationResult,
  SessionCompletionResult,
  SessionResetResult,
  SessionSummary,
  Achievement,
  MCQ,
  Typing,
  CustomQuestion,
  UserProgress
} from '../types/core';

import {
  getQuestions,
  getQuestionCount,
  getAvailableTracks,
  getAvailableFrameworks,
  getAvailableLevels,
  filterQuestionsByType,
  getRandomQuestions
} from '../data/questionBanks';

export class DojoEngine {
  private questionBank: QuestionBank;
  private currentSession: SessionData | null = null;
  private sessionHistory: SessionData[] = [];
  private customQuestions: CustomQuestion[] = [];

  constructor(questionBank: QuestionBank) {
    this.questionBank = questionBank;
    this.loadCustomQuestions();
  }

  // Enhanced Session Management
  startSession(config: SessionConfig): boolean {
    // End current session if exists
    if (this.currentSession && this.currentSession.state === SessionState.ACTIVE) {
      this.pauseSession();
    }

    const questions = this.getQuestionsForSession(config);

    if (questions.length === 0) {
      return false;
    }

    // Shuffle questions
    const shuffledQuestions = this.shuffleArray([...questions]);

    // Limit questions based on mode and config
    let finalQuestions = shuffledQuestions;
    if (config.questionCount) {
      finalQuestions = shuffledQuestions.slice(0, config.questionCount);
    } else {
      // Default question counts by mode
      switch (config.mode) {
        case 'Quiz':
          // Quiz mode: 6-14 questions, default 10 (already filtered to MCQ and typing)
          const quizCount = Math.min(Math.max(config.questionCount || 10, 6), 14);
          finalQuestions = shuffledQuestions.slice(0, quizCount);
          break;
        case 'Exam':
          finalQuestions = shuffledQuestions.slice(0, 20);
          break;
        case 'Study':
          // Show all questions in study mode
          break;
        default:
          finalQuestions = shuffledQuestions.slice(0, 15);
      }
    }

    // Create new session
    this.currentSession = {
      config,
      questions: finalQuestions,
      currentIndex: 0,
      answers: new Array(finalQuestions.length).fill(null),
      correct: new Array(finalQuestions.length).fill(false),
      startTime: new Date(),
      totalPausedDuration: 0,
      state: SessionState.ACTIVE,
      sessionId: this.generateSessionId()
    };

    return true;
  }

  // Session State Management
  getSessionState(): SessionState {
    return this.currentSession?.state || SessionState.IDLE;
  }

  pauseSession(): boolean {
    if (!this.currentSession || this.currentSession.state !== SessionState.ACTIVE) {
      return false;
    }

    this.currentSession.state = SessionState.PAUSED;
    this.currentSession.pausedTime = new Date();
    return true;
  }

  resumeSession(): boolean {
    if (!this.currentSession || this.currentSession.state !== SessionState.PAUSED) {
      return false;
    }

    if (this.currentSession.pausedTime) {
      const pausedDuration = Date.now() - this.currentSession.pausedTime.getTime();
      this.currentSession.totalPausedDuration = (this.currentSession.totalPausedDuration || 0) + pausedDuration;
      this.currentSession.pausedTime = undefined;
    }

    this.currentSession.state = SessionState.ACTIVE;
    return true;
  }

  isSessionActive(): boolean {
    return this.currentSession?.state === SessionState.ACTIVE;
  }

  getSessionDuration(): number {
    if (!this.currentSession || !this.currentSession.startTime) return 0;

    const now = Date.now();
    const startTime = this.currentSession.startTime.getTime();
    const totalDuration = now - startTime;

    // Subtract paused time
    let pausedDuration = this.currentSession.totalPausedDuration || 0;
    if (this.currentSession.state === SessionState.PAUSED && this.currentSession.pausedTime) {
      pausedDuration += now - this.currentSession.pausedTime.getTime();
    }

    return Math.max(0, totalDuration - pausedDuration);
  }

  getCurrentQuestion(): Question | null {
    if (!this.currentSession) return null;

    const { questions, currentIndex } = this.currentSession;
    if (currentIndex < 0 || currentIndex >= questions.length) return null;
    return questions[currentIndex] || null;
  }

  getSessionProgress(): SessionProgress {
    if (!this.currentSession) {
      return { current: 0, total: 0, correct: 0, score: 0 };
    }

    const { currentIndex, questions, correct } = this.currentSession;
    if (!questions || !correct) {
      return { current: 0, total: 0, correct: 0, score: 0 };
    }

    const correctCount = correct.slice(0, currentIndex).filter(Boolean).length;
    const score = currentIndex > 0 ? Math.round((correctCount / currentIndex) * 100) : 0;

    return {
      current: currentIndex,
      total: questions.length,
      correct: correctCount,
      score
    };
  }

  // Enhanced Answer Processing with Detailed Results
  answerMCQ(choiceIndex: number): AnswerResult {
    if (!this.isSessionActive()) {
      return {
        isCorrect: false,
        isValid: false,
        error: 'Session is not active',
        feedback: 'Please start a session first'
      };
    }

    // Quiz mode specific validation
    if (this.isQuizMode()) {
      const progress = this.getQuizProgress();
      if (progress.isComplete) {
        return {
          isCorrect: false,
          isValid: false,
          error: 'Quiz is already complete',
          feedback: 'This quiz session has ended. Please start a new quiz.'
        };
      }
    }

    const question = this.getCurrentQuestion();
    if (!question || question.type !== 'mcq') {
      return {
        isCorrect: false,
        isValid: false,
        error: 'Invalid question type',
        feedback: 'This is not a multiple choice question'
      };
    }

    // Validate choice index
    const mcqQuestion = question as MCQ;
    if (choiceIndex < 0 || choiceIndex >= mcqQuestion.choices.length) {
      return {
        isCorrect: false,
        isValid: false,
        error: 'Invalid choice index',
        feedback: 'Please select a valid option'
      };
    }

    const isCorrect = choiceIndex === mcqQuestion.answerIndex;
    const selectedChoice = mcqQuestion.choices[choiceIndex];
    const correctChoice = mcqQuestion.choices[mcqQuestion.answerIndex];

    this.recordAnswer(choiceIndex, isCorrect);

    return {
      isCorrect,
      isValid: true,
      selectedAnswer: selectedChoice,
      correctAnswer: correctChoice,
      explanation: mcqQuestion.explanation,
      feedback: isCorrect
        ? 'Correct! Well done.'
        : `Incorrect. The correct answer is "${correctChoice}".`,
      score: this.calculateQuestionScore(isCorrect, question)
    };
  }

  answerTyping(input: string): AnswerResult {
    if (!this.isSessionActive()) {
      return {
        isCorrect: false,
        isValid: false,
        error: 'Session is not active',
        feedback: 'Please start a session first'
      };
    }

    // Quiz mode specific validation
    if (this.isQuizMode()) {
      const progress = this.getQuizProgress();
      if (progress.isComplete) {
        return {
          isCorrect: false,
          isValid: false,
          error: 'Quiz is already complete',
          feedback: 'This quiz session has ended. Please start a new quiz.'
        };
      }
    }

    const question = this.getCurrentQuestion();
    if (!question || question.type !== 'typing') {
      return {
        isCorrect: false,
        isValid: false,
        error: 'Invalid question type',
        feedback: 'This is not a typing question'
      };
    }

    // Validate input
    if (!input || input.trim().length === 0) {
      return {
        isCorrect: false,
        isValid: false,
        error: 'Empty input',
        feedback: 'Please enter an answer'
      };
    }

    const typingQuestion = question as Typing;
    const normalizedInput = this.normalizeText(input.trim());

    // Check for exact matches first
    let isCorrect = typingQuestion.accept.some(answer =>
      this.normalizeText(answer) === normalizedInput
    );

    // If no exact match, check for partial matches (fuzzy matching)
    let matchType = 'exact';
    if (!isCorrect) {
      isCorrect = this.checkFuzzyMatch(normalizedInput, typingQuestion.accept);
      matchType = 'partial';
    }

    const correctAnswers = typingQuestion.accept;
    this.recordAnswer(input.trim(), isCorrect);

    return {
      isCorrect,
      isValid: true,
      selectedAnswer: input.trim(),
      correctAnswer: correctAnswers[0], // Primary correct answer
      acceptedAnswers: correctAnswers,
      explanation: typingQuestion.explanation,
      feedback: isCorrect
        ? matchType === 'exact'
          ? 'Perfect! Exactly right.'
          : 'Good! Close enough.'
        : `Incorrect. Accepted answers: ${correctAnswers.join(', ')}`,
      score: this.calculateQuestionScore(isCorrect, question, matchType === 'partial' ? 0.8 : 1.0)
    };
  }

  answerOpen(input: string): AnswerResult {
    if (!this.isSessionActive()) {
      return {
        isCorrect: true, // Open questions are always "correct"
        isValid: false,
        error: 'Session is not active',
        feedback: 'Please start a session first'
      };
    }

    const question = this.getCurrentQuestion();
    if (!question || question.type !== 'open') {
      return {
        isCorrect: true,
        isValid: false,
        error: 'Invalid question type',
        feedback: 'This is not an open-ended question'
      };
    }

    // Validate input length
    if (!input || input.trim().length === 0) {
      return {
        isCorrect: true,
        isValid: false,
        error: 'Empty input',
        feedback: 'Please provide an answer'
      };
    }

    if (input.trim().length < 10) {
      return {
        isCorrect: true,
        isValid: true,
        selectedAnswer: input.trim(),
        explanation: question.explanation,
        feedback: 'Thank you for your answer. Consider providing more detail.',
        score: this.calculateQuestionScore(true, question, 0.7),
        suggestions: ['Try to elaborate more on your answer', 'Add specific examples', 'Explain your reasoning']
      };
    }

    this.recordAnswer(input.trim(), true);

    return {
      isCorrect: true,
      isValid: true,
      selectedAnswer: input.trim(),
      explanation: question.explanation,
      feedback: 'Great! Thank you for your detailed response.',
      score: this.calculateQuestionScore(true, question),
      wordCount: input.trim().split(/\s+/).length
    };
  }

  private recordAnswer(answer: number | string, isCorrect: boolean): void {
    if (!this.currentSession) return;

    const { currentIndex, answers, correct } = this.currentSession;
    if (!answers || !correct || currentIndex < 0 || currentIndex >= answers.length) return;

    answers[currentIndex] = answer;
    correct[currentIndex] = isCorrect;
  }

  // Enhanced Navigation and Control
  nextQuestion(): NavigationResult {
    if (!this.isSessionActive()) {
      return {
        success: false,
        error: 'Session is not active',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    const { currentIndex, questions } = this.currentSession;

    if (currentIndex >= questions.length - 1) {
      return {
        success: false,
        error: 'Already at last question',
        currentIndex,
        totalQuestions: questions.length,
        isLastQuestion: true
      };
    }

    this.currentSession.currentIndex++;

    return {
      success: true,
      currentIndex: this.currentSession.currentIndex,
      totalQuestions: questions.length,
      isFirstQuestion: this.currentSession.currentIndex === 0,
      isLastQuestion: this.currentSession.currentIndex === questions.length - 1,
      question: this.getCurrentQuestion()
    };
  }

  previousQuestion(): NavigationResult {
    if (!this.isSessionActive()) {
      return {
        success: false,
        error: 'Session is not active',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    const { currentIndex, questions } = this.currentSession;

    if (currentIndex <= 0) {
      return {
        success: false,
        error: 'Already at first question',
        currentIndex,
        totalQuestions: questions.length,
        isFirstQuestion: true
      };
    }

    this.currentSession.currentIndex--;

    return {
      success: true,
      currentIndex: this.currentSession.currentIndex,
      totalQuestions: questions.length,
      isFirstQuestion: this.currentSession.currentIndex === 0,
      isLastQuestion: this.currentSession.currentIndex === questions.length - 1,
      question: this.getCurrentQuestion()
    };
  }

  skipQuestion(): NavigationResult {
    if (!this.isSessionActive()) {
      return {
        success: false,
        error: 'Session is not active',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    const { currentIndex, answers, correct, questions } = this.currentSession;

    // Mark current question as skipped
    answers[currentIndex] = null;
    correct[currentIndex] = false;

    // Don't auto-advance - let the UI handle navigation

    return {
      success: true,
      currentIndex: this.currentSession.currentIndex,
      totalQuestions: questions.length,
      isFirstQuestion: this.currentSession.currentIndex === 0,
      isLastQuestion: this.currentSession.currentIndex === questions.length - 1,
      question: this.getCurrentQuestion(),
      wasSkipped: true
    };
  }

  jumpToQuestion(index: number): NavigationResult {
    if (!this.isSessionActive()) {
      return {
        success: false,
        error: 'Session is not active',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    const { questions } = this.currentSession;

    if (index < 0 || index >= questions.length) {
      return {
        success: false,
        error: `Invalid question index: ${index}. Must be between 0 and ${questions.length - 1}`,
        currentIndex: this.currentSession.currentIndex,
        totalQuestions: questions.length
      };
    }

    const previousIndex = this.currentSession.currentIndex;
    this.currentSession.currentIndex = index;

    return {
      success: true,
      currentIndex: index,
      totalQuestions: questions.length,
      isFirstQuestion: index === 0,
      isLastQuestion: index === questions.length - 1,
      question: this.getCurrentQuestion(),
      previousIndex
    };
  }

  hasNextQuestion(): boolean {
    if (!this.currentSession) return false;

    return this.currentSession.currentIndex < this.currentSession.questions.length - 1;
  }

  hasPreviousQuestion(): boolean {
    if (!this.currentSession) return false;

    return this.currentSession.currentIndex > 0;
  }

  // Enhanced Session Completion Logic
  finishSession(): SessionCompletionResult {
    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session to finish'
      };
    }

    if (this.currentSession.state === SessionState.COMPLETED) {
      return {
        success: false,
        error: 'Session is already completed'
      };
    }

    // Mark session as completed
    this.currentSession.state = SessionState.COMPLETED;

    const { config, correct, questions, answers } = this.currentSession;
    // Count all answered questions (not just up to current position)
    const answeredQuestions = answers.filter(answer => answer !== null).length;
    const correctCount = correct.filter(Boolean).length;
    const skippedCount = answers.filter(answer => answer === null).length;
    const totalQuestions = questions.length;
    const scorePct = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    // Calculate session duration
    const sessionDuration = this.getSessionDuration();

    const progressEntry: ProgressEntry = {
      date: new Date().toISOString(),
      track: config.track,
      framework: config.framework,
      level: config.level,
      mode: config.mode,
      scorePct,
      total: totalQuestions,
      correct: correctCount
    };

    // Create detailed session summary
    const sessionSummary: SessionSummary = {
      sessionId: this.currentSession.sessionId,
      config,
      totalQuestions,
      answeredQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: answeredQuestions - correctCount,
      skippedQuestions: skippedCount,
      scorePct,
      completionRate,
      sessionDuration,
      startTime: this.currentSession.startTime,
      endTime: new Date(),
      questions: questions.map((question, index) => ({
        question,
        answer: answers[index],
        isCorrect: correct[index],
        wasSkipped: answers[index] === null
      }))
    };

    // Add to session history
    this.sessionHistory.push({ ...this.currentSession });

    return {
      success: true,
      progressEntry,
      sessionSummary,
      achievements: this.calculateAchievements(sessionSummary)
    };
  }

  // Calculate achievements based on session performance
  private calculateAchievements(summary: SessionSummary): Achievement[] {
    const achievements: Achievement[] = [];

    // Perfect score achievement
    if (summary.scorePct === 100 && summary.completionRate === 100) {
      achievements.push({
        id: 'perfect_score',
        title: 'Perfect Score!',
        description: 'Answered all questions correctly',
        icon: '🏆',
        rarity: 'legendary'
      });
    }

    // High score achievement
    if (summary.scorePct >= 90 && summary.completionRate >= 90) {
      achievements.push({
        id: 'high_score',
        title: 'Excellent Performance',
        description: 'Scored 90% or higher',
        icon: '⭐',
        rarity: 'rare'
      });
    }

    // Speed achievement (less than 30 seconds per question)
    const avgTimePerQuestion = summary.sessionDuration / summary.totalQuestions;
    if (avgTimePerQuestion < 30000 && summary.scorePct >= 80) {
      achievements.push({
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Fast and accurate answers',
        icon: '⚡',
        rarity: 'epic'
      });
    }

    // Completion achievement
    if (summary.completionRate === 100) {
      achievements.push({
        id: 'completionist',
        title: 'Completionist',
        description: 'Answered all questions',
        icon: '✅',
        rarity: 'common'
      });
    }

    // No skips achievement
    if (summary.skippedQuestions === 0 && summary.totalQuestions > 5) {
      achievements.push({
        id: 'no_skips',
        title: 'No Skips',
        description: 'Attempted every question',
        icon: '🎯',
        rarity: 'uncommon'
      });
    }

    return achievements;
  }

  // Enhanced Session Reset
  resetSession(saveToHistory: boolean = true): SessionResetResult {
    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session to reset',
        sessionId: '',
        wasCompleted: false,
        questionsAnswered: 0,
        savedToHistory: false
      };
    }

    const sessionId = this.currentSession.sessionId;
    const wasCompleted = this.currentSession.state === SessionState.COMPLETED;
    const questionsAnswered = this.currentSession.answers.filter(a => a !== null).length;

    // Save to history if requested and session has progress
    if (saveToHistory && questionsAnswered > 0) {
      // Mark as incomplete if not already completed
      if (this.currentSession.state !== SessionState.COMPLETED) {
        this.currentSession.state = SessionState.IDLE;
      }
      this.sessionHistory.push({ ...this.currentSession });
    }

    // Clear stored session
    this.clearStoredSession();

    // Reset current session
    this.currentSession = null;

    return {
      success: true,
      sessionId,
      wasCompleted,
      questionsAnswered,
      savedToHistory: saveToHistory && questionsAnswered > 0
    };
  }

  // Soft reset - restart current session without losing configuration
  restartSession(): SessionResetResult {
    if (!this.currentSession) {
      return {
        success: false,
        error: 'No active session to restart',
        sessionId: '',
        wasCompleted: false,
        questionsAnswered: 0,
        savedToHistory: false
      };
    }

    const config = { ...this.currentSession.config };
    const sessionId = this.currentSession.sessionId;

    // Reset current session
    this.resetSession(false);

    // Start new session with same configuration
    const startSuccess = this.startSession(config);

    if (!startSuccess) {
      return {
        success: false,
        error: 'Failed to restart session with same configuration',
        sessionId,
        wasCompleted: false,
        questionsAnswered: 0,
        savedToHistory: false
      };
    }

    return {
      success: true,
      sessionId,
      wasCompleted: false,
      questionsAnswered: 0,
      savedToHistory: false,
      restarted: true,
      newSessionId: this.currentSession?.sessionId
    };
  }

  // Force reset - clear everything including history
  forceReset(): SessionResetResult {
    const hadSession = this.currentSession !== null;
    const sessionCount = this.sessionHistory.length;

    // Clear everything
    this.currentSession = null;
    this.sessionHistory = [];
    this.clearStoredSession();

    return {
      success: true,
      sessionId: 'force_reset',
      wasCompleted: false,
      questionsAnswered: 0,
      savedToHistory: false,
      clearedHistory: sessionCount,
      hadActiveSession: hadSession
    };
  }

  // Session History Management
  getSessionHistory(): SessionData[] {
    return [...this.sessionHistory];
  }

  clearSessionHistory(): void {
    this.sessionHistory = [];
  }

  getSessionById(sessionId: string): SessionData | null {
    return this.sessionHistory.find(session => session.sessionId === sessionId) || null;
  }

  // Helper Methods

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  // Enhanced Text Processing
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\u00a0/g, ' '); // Replace non-breaking spaces
  }

  // Fuzzy Matching for Typing Questions
  private checkFuzzyMatch(input: string, acceptedAnswers: string[]): boolean {
    const threshold = 0.8; // 80% similarity threshold

    return acceptedAnswers.some(answer => {
      const normalizedAnswer = this.normalizeText(answer);
      const similarity = this.calculateStringSimilarity(input, normalizedAnswer);
      return similarity >= threshold;
    });
  }

  // Calculate string similarity using Levenshtein distance
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  // Question Scoring System
  private calculateQuestionScore(isCorrect: boolean, question: Question, multiplier: number = 1.0): number {
    if (!isCorrect) return 0;

    // Base scores by question type
    const baseScores = {
      mcq: 10,
      typing: 15,
      open: 20
    };

    const baseScore = baseScores[question.type] || 10;
    return Math.round(baseScore * multiplier);
  }

  // Answer Validation
  validateAnswer(questionType: string, answer: any): ValidationResult {
    switch (questionType) {
      case 'mcq':
        return this.validateMCQAnswer(answer);
      case 'typing':
        return this.validateTypingAnswer(answer);
      case 'open':
        return this.validateOpenAnswer(answer);
      default:
        return {
          isValid: false,
          errors: ['Unknown question type'],
          suggestions: ['Please check the question type']
        };
    }
  }

  private validateMCQAnswer(choiceIndex: any): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (typeof choiceIndex !== 'number') {
      errors.push('Choice index must be a number');
      suggestions.push('Select one of the available options');
    }

    if (choiceIndex < 0) {
      errors.push('Choice index cannot be negative');
      suggestions.push('Select a valid option');
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  private validateTypingAnswer(input: any): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (typeof input !== 'string') {
      errors.push('Answer must be text');
      suggestions.push('Type your answer in the text field');
    }

    if (typeof input === 'string') {
      if (input.trim().length === 0) {
        errors.push('Answer cannot be empty');
        suggestions.push('Please type an answer');
      }

      if (input.length > 500) {
        errors.push('Answer is too long');
        suggestions.push('Keep your answer under 500 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  private validateOpenAnswer(input: any): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (typeof input !== 'string') {
      errors.push('Answer must be text');
      suggestions.push('Write your answer in the text area');
    }

    if (typeof input === 'string') {
      if (input.trim().length === 0) {
        errors.push('Answer cannot be empty');
        suggestions.push('Please provide an answer');
      }

      if (input.length > 2000) {
        errors.push('Answer is too long');
        suggestions.push('Keep your answer under 2000 characters');
      }

      if (input.trim().length < 5) {
        suggestions.push('Consider providing a more detailed answer');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  // Enhanced Question Bank Management
  getAvailableTracks(): string[] {
    return getAvailableTracks();
  }

  getAvailableFrameworks(track: Track): string[] {
    return getAvailableFrameworks(track);
  }

  getAvailableLevels(track: Track, framework: Framework): string[] {
    return getAvailableLevels(track, framework);
  }

  getQuestionCount(track: Track, framework: Framework, level: string): number {
    return getQuestionCount(track, framework, level);
  }

  getQuestionsByType(track: Track, framework: Framework, level: string, questionType: 'mcq' | 'typing' | 'open'): Question[] {
    return filterQuestionsByType(track, framework, level, questionType);
  }

  getRandomQuestionsFromBank(track: Track, framework: Framework, level: string, count: number): Question[] {
    return getRandomQuestions(track, framework, level, count);
  }

  // Enhanced Question Selection for Sessions
  private getQuestionsForSession(config: SessionConfig): Question[] {
    const { track, framework, level, mode } = config;

    // Get all questions including custom questions
    let questions: Question[] = [];

    if (mode === 'Quiz') {
      // Quiz mode: only MCQ and typing questions
      questions = this.getQuestionsWithCustom(track, framework, level, ['mcq', 'typing']);
    } else {
      // Other modes: all question types
      questions = this.getQuestionsWithCustom(track, framework, level);
    }

    if (questions.length === 0) {
      // Fallback to question bank if new system doesn't have questions
      const trackData = this.questionBank?.[track];
      if (trackData) {
        const frameworkData = trackData[framework];
        if (frameworkData) {
          const levelQuestions = frameworkData[level];
          if (levelQuestions && Array.isArray(levelQuestions)) {
            questions = [...levelQuestions];
          }
        }
      }
    }

    // Apply mode-specific filtering if needed
    if (mode === 'Exam') {
      // For exam mode, get balanced selection of question types
      const mcqQuestions = questions.filter(q => q.type === 'mcq');
      const typingQuestions = questions.filter(q => q.type === 'typing');
      const openQuestions = questions.filter(q => q.type === 'open');

      // Mix question types for exam
      const examQuestions = [
        ...this.shuffleArray(mcqQuestions).slice(0, Math.ceil(20 * 0.6)), // 60% MCQ
        ...this.shuffleArray(typingQuestions).slice(0, Math.ceil(20 * 0.3)), // 30% Typing
        ...this.shuffleArray(openQuestions).slice(0, Math.ceil(20 * 0.1)) // 10% Open
      ];

      questions = this.shuffleArray(examQuestions).slice(0, 20);
    }

    return questions;
  }

  // Daily Challenge
  generateDailyChallenge(track: Track, framework: Framework, level: string): Question[] {
    const questions = this.getQuestionsForSession({ track, framework, level, mode: 'Quiz' });
    const shuffled = this.shuffleArray(questions);
    return shuffled.slice(0, 10); // Always 10 questions for daily challenge
  }

  // Session Utilities
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentSessionData(): SessionData | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  getSessionStats(): {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    totalTimeSpent: number;
  } {
    const completedSessions = this.sessionHistory.filter(s => s.state === SessionState.COMPLETED);
    const totalSessions = this.sessionHistory.length;

    if (completedSessions.length === 0) {
      return {
        totalSessions,
        completedSessions: 0,
        averageScore: 0,
        totalTimeSpent: 0
      };
    }

    const totalCorrect = completedSessions.reduce((sum, session) =>
      sum + session.correct.filter(Boolean).length, 0
    );
    const totalQuestions = completedSessions.reduce((sum, session) =>
      sum + session.correct.length, 0 // Use correct.length instead of questions.length for answered questions
    );

    const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    const totalTimeSpent = completedSessions.reduce((sum, session) => {
      const duration = session.startTime ? Date.now() - session.startTime.getTime() : 0;
      return sum + Math.max(0, duration - session.totalPausedDuration);
    }, 0);

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent
    };
  }

  // Session Validation
  validateSession(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.currentSession) {
      errors.push('No active session');
      return { isValid: false, errors };
    }

    if (this.currentSession.questions.length === 0) {
      errors.push('Session has no questions');
    }

    if (this.currentSession.currentIndex < 0 ||
      this.currentSession.currentIndex >= this.currentSession.questions.length) {
      errors.push('Invalid question index');
    }

    if (this.currentSession.answers.length !== this.currentSession.questions.length) {
      errors.push('Answers array length mismatch');
    }

    if (this.currentSession.correct.length !== this.currentSession.questions.length) {
      errors.push('Correct array length mismatch');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Session Recovery
  saveSessionToStorage(): boolean {
    if (!this.currentSession) return false;

    try {
      const sessionData = JSON.stringify(this.currentSession);
      localStorage.setItem('dojo-current-session', sessionData);
      return true;
    } catch (error) {
      console.error('Failed to save session to storage:', error);
      return false;
    }
  }

  loadSessionFromStorage(): boolean {
    try {
      const sessionData = localStorage.getItem('dojo-current-session');
      if (!sessionData) return false;

      const parsed = JSON.parse(sessionData);

      // Validate loaded session
      if (parsed && parsed.sessionId && parsed.questions && Array.isArray(parsed.questions)) {
        // Convert date strings back to Date objects
        parsed.startTime = new Date(parsed.startTime);
        if (parsed.pausedTime) {
          parsed.pausedTime = new Date(parsed.pausedTime);
        }

        this.currentSession = parsed;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to load session from storage:', error);
      return false;
    }
  }

  clearStoredSession(): void {
    localStorage.removeItem('dojo-current-session');
  }

  // Custom Question Management
  createCustomQuestion(questionData: Omit<CustomQuestion, 'id' | '_created'>): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validate required fields
    if (!questionData.prompt?.trim()) {
      errors.push('Question prompt is required');
    }

    if (!questionData.type) {
      errors.push('Question type is required');
    }

    if (!questionData._track) {
      errors.push('Track is required');
    }

    if (!questionData._framework) {
      errors.push('Framework is required');
    }

    if (!questionData._level?.trim()) {
      errors.push('Level is required');
    }

    // Type-specific validation
    if (questionData.type === 'mcq') {
      if (!questionData.choices || questionData.choices.length < 2) {
        errors.push('MCQ questions must have at least 2 choices');
      }
      if (questionData.answerIndex === undefined || questionData.answerIndex < 0 ||
        (questionData.choices && questionData.answerIndex >= questionData.choices.length)) {
        errors.push('MCQ questions must have a valid answer index');
      }
    }

    if (questionData.type === 'typing') {
      if (!questionData.accept || questionData.accept.length === 0) {
        errors.push('Typing questions must have at least one accepted answer');
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, suggestions };
    }

    // Create the custom question
    const customQuestion: CustomQuestion = {
      ...questionData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      _created: new Date().toISOString()
    };

    // Add to custom questions array
    this.customQuestions.push(customQuestion);
    this.saveCustomQuestions();

    return { isValid: true, errors: [], suggestions: ['Custom question created successfully'] };
  }

  getCustomQuestions(track?: Track, framework?: Framework, level?: string): CustomQuestion[] {
    let filtered = [...this.customQuestions];

    if (track) {
      filtered = filtered.filter(q => q._track === track);
    }

    if (framework) {
      filtered = filtered.filter(q => q._framework === framework);
    }

    if (level) {
      filtered = filtered.filter(q => q._level === level);
    }

    return filtered;
  }

  updateCustomQuestion(id: string, updates: Partial<Omit<CustomQuestion, 'id' | '_created'>>): ValidationResult {
    const questionIndex = this.customQuestions.findIndex(q => q.id === id);

    if (questionIndex === -1) {
      return { isValid: false, errors: ['Custom question not found'], suggestions: [] };
    }

    const question = this.customQuestions[questionIndex];
    const updatedQuestion = { ...question, ...updates };

    // Validate the updated question
    const validation = this.validateCustomQuestion(updatedQuestion);
    if (!validation.isValid) {
      return validation;
    }

    this.customQuestions[questionIndex] = updatedQuestion;
    this.saveCustomQuestions();

    return { isValid: true, errors: [], suggestions: ['Custom question updated successfully'] };
  }

  deleteCustomQuestion(id: string): boolean {
    const initialLength = this.customQuestions.length;
    this.customQuestions = this.customQuestions.filter(q => q.id !== id);

    if (this.customQuestions.length < initialLength) {
      this.saveCustomQuestions();
      return true;
    }

    return false;
  }

  private validateCustomQuestion(question: CustomQuestion): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!question.prompt?.trim()) {
      errors.push('Question prompt is required');
    }

    if (!question.type) {
      errors.push('Question type is required');
    }

    if (!question._track) {
      errors.push('Track is required');
    }

    if (!question._framework) {
      errors.push('Framework is required');
    }

    if (!question._level?.trim()) {
      errors.push('Level is required');
    }

    // Type-specific validation
    if (question.type === 'mcq') {
      if (!question.choices || question.choices.length < 2) {
        errors.push('MCQ questions must have at least 2 choices');
      }
      if (question.answerIndex === undefined || question.answerIndex < 0 ||
        (question.choices && question.answerIndex >= question.choices.length)) {
        errors.push('MCQ questions must have a valid answer index');
      }
    }

    if (question.type === 'typing') {
      if (!question.accept || question.accept.length === 0) {
        errors.push('Typing questions must have at least one accepted answer');
      }
    }

    return { isValid: errors.length === 0, errors, suggestions };
  }

  private loadCustomQuestions(): void {
    try {
      const stored = localStorage.getItem('dojo-custom-questions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.customQuestions = parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load custom questions:', error);
      this.customQuestions = [];
    }
  }

  private saveCustomQuestions(): void {
    try {
      localStorage.setItem('dojo-custom-questions', JSON.stringify(this.customQuestions));
    } catch (error) {
      console.error('Failed to save custom questions:', error);
    }
  }

  // Quiz Mode Specific Methods
  startQuizSession(track: Track, framework: Framework, level: string, questionCount?: number): boolean {
    // Validate question count for quiz mode
    const validQuestionCount = questionCount ? Math.min(Math.max(questionCount, 6), 14) : 10;

    return this.startSession({
      track,
      framework,
      level,
      mode: 'Quiz',
      questionCount: validQuestionCount
    });
  }

  getQuizProgress(): {
    current: number;
    total: number;
    correct: number;
    score: number;
    isComplete: boolean;
    timeElapsed: number;
  } {
    const baseProgress = this.getSessionProgress();
    const isComplete = this.currentSession && this.currentSession.answers && this.currentSession.questions ?
      this.currentSession.answers.filter(a => a !== null).length >= this.currentSession.questions.length : false;
    const timeElapsed = this.getSessionDuration();

    return {
      ...baseProgress,
      isComplete,
      timeElapsed
    };
  }

  isQuizMode(): boolean {
    return this.currentSession?.config.mode === 'Quiz';
  }

  getQuizQuestions(): Question[] {
    if (!this.currentSession || !this.isQuizMode()) {
      return [];
    }
    return [...this.currentSession.questions];
  }

  getQuizResults(): {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    scorePct: number;
    timeElapsed: number;
    questionsWithAnswers: Array<{
      question: Question;
      userAnswer: number | string | null;
      isCorrect: boolean;
      wasSkipped: boolean;
    }>;
  } | null {
    if (!this.currentSession || !this.isQuizMode()) {
      return null;
    }

    const { questions, answers, correct } = this.currentSession;
    if (!questions || !answers || !correct) {
      return null;
    }

    const totalQuestions = questions.length;
    const correctAnswers = correct.filter(Boolean).length;
    const answeredQuestions = answers.filter(a => a !== null).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const skippedQuestions = answers.filter(a => a === null).length;
    const scorePct = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timeElapsed = this.getSessionDuration();

    const questionsWithAnswers = questions.map((question, index) => ({
      question,
      userAnswer: answers[index] ?? null,
      isCorrect: correct[index] ?? false,
      wasSkipped: (answers[index] ?? null) === null
    }));

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      scorePct,
      timeElapsed,
      questionsWithAnswers
    };
  }

  // Study Mode Specific Methods
  startStudySession(track: Track, framework: Framework, level: string): boolean {
    return this.startSession({
      track,
      framework,
      level,
      mode: 'Study'
    });
  }

  isStudyMode(): boolean {
    return this.currentSession?.config.mode === 'Study';
  }

  getStudyQuestions(): Question[] {
    if (!this.currentSession || !this.isStudyMode()) {
      return [];
    }
    return [...this.currentSession.questions];
  }

  getStudyProgress(): {
    current: number;
    total: number;
    viewed: number;
    completionRate: number;
    timeElapsed: number;
  } {
    if (!this.currentSession || !this.isStudyMode()) {
      return { current: 0, total: 0, viewed: 0, completionRate: 0, timeElapsed: 0 };
    }

    const { currentIndex, questions, answers } = this.currentSession;
    if (!questions || !answers) {
      return { current: 0, total: 0, viewed: 0, completionRate: 0, timeElapsed: 0 };
    }

    const viewed = answers.filter(a => a !== null).length;
    const completionRate = questions.length > 0 ? (viewed / questions.length) * 100 : 0;
    const timeElapsed = this.getSessionDuration();

    return {
      current: currentIndex,
      total: questions.length,
      viewed,
      completionRate,
      timeElapsed
    };
  }

  getCurrentQuestionWithAnswer(): {
    question: Question | null;
    explanation: string | null;
    hasNext: boolean;
    hasPrevious: boolean;
    index: number;
    total: number;
  } {
    if (!this.currentSession || !this.isStudyMode()) {
      return {
        question: null,
        explanation: null,
        hasNext: false,
        hasPrevious: false,
        index: 0,
        total: 0
      };
    }

    const question = this.getCurrentQuestion();
    const { currentIndex, questions } = this.currentSession;

    return {
      question,
      explanation: question?.explanation || null,
      hasNext: this.hasNextQuestion(),
      hasPrevious: this.hasPreviousQuestion(),
      index: currentIndex,
      total: questions?.length || 0
    };
  }

  markQuestionAsViewed(): void {
    if (!this.currentSession || !this.isStudyMode()) return;

    const { currentIndex, answers } = this.currentSession;
    if (!answers || currentIndex < 0 || currentIndex >= answers.length) return;

    // Mark as viewed (use a special marker for study mode)
    answers[currentIndex] = 'viewed';
  }

  getStudySessionSummary(): {
    totalQuestions: number;
    viewedQuestions: number;
    timeSpent: number;
    questionsWithDetails: Array<{
      question: Question;
      wasViewed: boolean;
      explanation: string | null;
    }>;
  } | null {
    if (!this.currentSession || !this.isStudyMode()) {
      return null;
    }

    const { questions, answers } = this.currentSession;
    if (!questions || !answers) {
      return null;
    }

    const totalQuestions = questions.length;
    const viewedQuestions = answers.filter(a => a !== null).length;
    const timeSpent = this.getSessionDuration();

    const questionsWithDetails = questions.map((question, index) => ({
      question,
      wasViewed: answers[index] !== null,
      explanation: question.explanation || null
    }));

    return {
      totalQuestions,
      viewedQuestions,
      timeSpent,
      questionsWithDetails
    };
  }

  // Study mode navigation with auto-marking as viewed
  nextQuestionInStudy(): NavigationResult {
    if (!this.isStudyMode()) {
      return {
        success: false,
        error: 'Not in study mode',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    // Mark current question as viewed before moving
    this.markQuestionAsViewed();

    return this.nextQuestion();
  }

  previousQuestionInStudy(): NavigationResult {
    if (!this.isStudyMode()) {
      return {
        success: false,
        error: 'Not in study mode',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    return this.previousQuestion();
  }

  jumpToQuestionInStudy(index: number): NavigationResult {
    if (!this.isStudyMode()) {
      return {
        success: false,
        error: 'Not in study mode',
        currentIndex: -1,
        totalQuestions: 0
      };
    }

    // Mark current question as viewed before jumping
    this.markQuestionAsViewed();

    return this.jumpToQuestion(index);
  }

  // Test utility methods
  clearAllCustomQuestions(): void {
    this.customQuestions = [];
    localStorage.removeItem('dojo-custom-questions');
  }

  // Integration with existing question pools
  private getQuestionsWithCustom(track: Track, framework: Framework, level: string, allowedTypes?: ('mcq' | 'typing' | 'open')[]): Question[] {
    // Get standard questions
    const standardQuestions = getQuestions(track, framework, level);

    // Get matching custom questions
    const customQuestions = this.getCustomQuestions(track, framework, level);

    // Convert custom questions to standard Question format
    const convertedCustom: Question[] = customQuestions.map(cq => {
      const baseQuestion = {
        id: cq.id,
        type: cq.type,
        prompt: cq.prompt,
        explanation: cq.explanation
      };

      if (cq.type === 'mcq') {
        return {
          ...baseQuestion,
          type: 'mcq' as const,
          choices: cq.choices || [],
          answerIndex: cq.answerIndex || 0
        };
      } else if (cq.type === 'typing') {
        return {
          ...baseQuestion,
          type: 'typing' as const,
          accept: cq.accept || []
        };
      } else {
        return {
          ...baseQuestion,
          type: 'open' as const,
          rubric: cq.rubric
        };
      }
    });

    const allQuestions = [...standardQuestions, ...convertedCustom];

    // Filter by allowed types if specified
    if (allowedTypes) {
      return allQuestions.filter(q => allowedTypes.includes(q.type));
    }

    return allQuestions;
  }

  // Export/Import functionality
  exportUserData(): UserProgress {
    const entries = this.getSessionHistory().map(session => ({
      date: session.startTime.toISOString().split('T')[0],
      track: session.config.track,
      framework: session.config.framework,
      level: session.config.level,
      scorePct: Math.round((session.correct.filter(Boolean).length / session.questions.length) * 100),
      total: session.questions.length,
      correct: session.correct.filter(Boolean).length,
      mode: session.config.mode
    }));

    return {
      entries,
      customQuestions: this.customQuestions,
      preferences: {
        defaultTrack: 'EN',
        defaultFramework: 'Classic',
        defaultLevel: 'Beginner',
        enableDictionary: true,
        enableCustomQuestions: true
      },
      statistics: {
        totalSessions: entries.length,
        totalQuestions: entries.reduce((sum, entry) => sum + entry.total, 0),
        averageScore: entries.length > 0 ?
          entries.reduce((sum, entry) => sum + entry.scorePct, 0) / entries.length : 0,
        streakDays: 0,
        lastActivity: entries.length > 0 ? entries[entries.length - 1].date : ''
      }
    };
  }

  importUserData(userData: UserProgress): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    try {
      // Validate structure
      if (!userData.customQuestions || !Array.isArray(userData.customQuestions)) {
        errors.push('Invalid custom questions data');
      }

      if (!userData.entries || !Array.isArray(userData.entries)) {
        errors.push('Invalid progress entries data');
      }

      if (errors.length > 0) {
        return { isValid: false, errors, suggestions };
      }

      // Import custom questions (merge without duplicates)
      const existingIds = new Set(this.customQuestions.map(q => q.id));
      const newQuestions = userData.customQuestions.filter(q => !existingIds.has(q.id));

      this.customQuestions.push(...newQuestions);
      this.saveCustomQuestions();

      suggestions.push(`Imported ${newQuestions.length} new custom questions`);
      suggestions.push(`Imported ${userData.entries.length} progress entries`);

      return { isValid: true, errors: [], suggestions };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to import user data: ' + (error as Error).message],
        suggestions: []
      };
    }
  }
}