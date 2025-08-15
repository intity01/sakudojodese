// Minimal Question Bank for Fast Loading
import type { QuestionBank, MCQ, Typing, Open } from '../types/core';

const englishQuestions: (MCQ | Typing | Open)[] = [
  {
    id: 'en-001',
    type: 'mcq',
    prompt: 'What is the past tense of "go"?',
    choices: ['went', 'gone', 'going', 'goes'],
    answerIndex: 0,
    explanation: 'The past tense of "go" is "went".'
  },
  {
    id: 'en-002',
    type: 'mcq',
    prompt: 'Choose the correct article: "I saw ___ elephant."',
    choices: ['a', 'an', 'the', 'no article'],
    answerIndex: 1,
    explanation: 'Use "an" before words starting with vowel sounds.'
  },
  {
    id: 'en-003',
    type: 'typing',
    prompt: 'Type the word for "สวัสดี" in English:',
    accept: ['hello', 'hi'],
    explanation: 'สวัสดี means "hello" or "hi" in English.'
  },
  {
    id: 'en-004',
    type: 'mcq',
    prompt: 'Which is correct?',
    choices: ['I am happy', 'I is happy', 'I are happy', 'I be happy'],
    answerIndex: 0,
    explanation: 'Use "am" with "I".'
  },
  {
    id: 'en-005',
    type: 'typing',
    prompt: 'Type the plural of "child":',
    accept: ['children'],
    explanation: 'The plural of "child" is "children".'
  },
  {
    id: 'en-006',
    type: 'mcq',
    prompt: 'What does "beautiful" mean?',
    choices: ['ugly', 'pretty', 'big', 'small'],
    answerIndex: 1,
    explanation: 'Beautiful means pretty or attractive.'
  },
  {
    id: 'en-007',
    type: 'typing',
    prompt: 'Type the opposite of "hot":',
    accept: ['cold'],
    explanation: 'The opposite of hot is cold.'
  },
  {
    id: 'en-008',
    type: 'mcq',
    prompt: 'Choose the correct form: "She ___ to school."',
    choices: ['go', 'goes', 'going', 'gone'],
    answerIndex: 1,
    explanation: 'Use "goes" with third person singular (she/he/it).'
  },
  {
    id: 'en-009',
    type: 'typing',
    prompt: 'Type the past tense of "eat":',
    accept: ['ate'],
    explanation: 'The past tense of "eat" is "ate".'
  },
  {
    id: 'en-010',
    type: 'mcq',
    prompt: 'What is the correct question word for asking about time?',
    choices: ['What', 'Where', 'When', 'Who'],
    answerIndex: 2,
    explanation: 'Use "When" to ask about time.'
  },
  {
    id: 'en-011',
    type: 'typing',
    prompt: 'Type the word for "ขอบคุณ" in English:',
    accept: ['thank you', 'thanks'],
    explanation: 'ขอบคุณ means "thank you" in English.'
  },
  {
    id: 'en-012',
    type: 'mcq',
    prompt: 'Which sentence is correct?',
    choices: ['I have a book', 'I has a book', 'I having a book', 'I had have a book'],
    answerIndex: 0,
    explanation: 'Use "have" with "I".'
  },
  {
    id: 'en-013',
    type: 'typing',
    prompt: 'Type the present continuous form of "run" (I ___ running):',
    accept: ['am'],
    explanation: 'Use "am" with "I" in present continuous.'
  },
  {
    id: 'en-014',
    type: 'mcq',
    prompt: 'What is the correct preposition: "I live ___ Bangkok."',
    choices: ['at', 'in', 'on', 'by'],
    answerIndex: 1,
    explanation: 'Use "in" with cities and countries.'
  },
  {
    id: 'en-015',
    type: 'typing',
    prompt: 'Type the comparative form of "good":',
    accept: ['better'],
    explanation: 'The comparative form of "good" is "better".'
  },
  {
    id: 'en-016',
    type: 'open',
    prompt: 'Describe your favorite food in 2-3 sentences.',
    explanation: 'Practice describing things you like using adjectives and reasons.'
  },
  {
    id: 'en-017',
    type: 'open',
    prompt: 'Write about what you did yesterday.',
    explanation: 'Practice using past tense to describe past events.'
  }
];

const japaneseQuestions: (MCQ | Typing | Open)[] = [
  {
    id: 'jp-001',
    type: 'mcq',
    prompt: 'What does "こんにちは" mean?',
    choices: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
    answerIndex: 1,
    explanation: 'こんにちは (konnichiwa) means "good afternoon" or general greeting.'
  },
  {
    id: 'jp-002',
    type: 'typing',
    prompt: 'Type "thank you" in Japanese (hiragana):',
    accept: ['ありがとう', 'arigatou'],
    explanation: 'ありがとう (arigatou) means "thank you" in Japanese.'
  },
  {
    id: 'jp-003',
    type: 'mcq',
    prompt: 'Which hiragana represents the sound "ka"?',
    choices: ['か', 'き', 'く', 'け'],
    answerIndex: 0,
    explanation: 'か (ka) is the hiragana character for the "ka" sound.'
  }
];

export const minimalQuestionBank: QuestionBank = {
  EN: {
    Classic: {
      Beginner: englishQuestions,
      Intermediate: englishQuestions,
      Advanced: englishQuestions,
      Expert: englishQuestions
    },
    CEFR: {
      A1: englishQuestions,
      A2: englishQuestions,
      B1: englishQuestions,
      B2: englishQuestions,
      C1: englishQuestions,
      C2: englishQuestions
    }
  },
  JP: {
    Classic: {
      Beginner: japaneseQuestions,
      Intermediate: japaneseQuestions,
      Advanced: japaneseQuestions,
      Expert: japaneseQuestions
    },
    JLPT: {
      N5: japaneseQuestions,
      N4: japaneseQuestions,
      N3: japaneseQuestions,
      N2: japaneseQuestions,
      N1: japaneseQuestions
    }
  }
};