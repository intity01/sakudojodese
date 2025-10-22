import { allExtendedLessons } from './extendedLessons';

export interface Lesson {
  id: string;
  language: 'english' | 'japanese';
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  vocabulary: VocabularyItem[];
  quiz: QuizQuestion[];
}

export interface VocabularyItem {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  example: string;
  audio?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export const englishLessons: Lesson[] = [
  {
    id: 'eng-beginner-1',
    language: 'english',
    level: 'beginner',
    title: 'Greetings and Introductions',
    description: 'Learn basic greetings and how to introduce yourself',
    vocabulary: [
      {
        id: 'v1',
        word: 'Hello',
        pronunciation: '/həˈloʊ/',
        meaning: 'สวัสดี',
        example: 'Hello! How are you?',
      },
      {
        id: 'v2',
        word: 'Good morning',
        pronunciation: '/ɡʊd ˈmɔːrnɪŋ/',
        meaning: 'สวัสดีตอนเช้า',
        example: 'Good morning, everyone!',
      },
      {
        id: 'v3',
        word: 'My name is',
        pronunciation: '/maɪ neɪm ɪz/',
        meaning: 'ชื่อของฉันคือ',
        example: 'My name is Sarah.',
      },
      {
        id: 'v4',
        word: 'Nice to meet you',
        pronunciation: '/naɪs tuː miːt juː/',
        meaning: 'ยินดีที่ได้รู้จัก',
        example: 'Nice to meet you, John!',
      },
      {
        id: 'v5',
        word: 'How are you?',
        pronunciation: '/haʊ ɑːr juː/',
        meaning: 'คุณเป็นอย่างไรบ้าง?',
        example: 'Hello! How are you today?',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the correct greeting in the morning?',
        type: 'multiple-choice',
        options: ['Good night', 'Good morning', 'Good evening', 'Good afternoon'],
        correctAnswer: 'Good morning',
        explanation: 'We use "Good morning" to greet people in the morning.',
      },
      {
        id: 'q2',
        question: 'How do you introduce yourself?',
        type: 'multiple-choice',
        options: ['My name is...', 'Your name is...', 'His name is...', 'Their name is...'],
        correctAnswer: 'My name is...',
        explanation: 'We use "My name is..." to introduce ourselves.',
      },
      {
        id: 'q3',
        question: 'Complete: "_____ to meet you!"',
        type: 'fill-blank',
        correctAnswer: 'Nice',
        explanation: 'The complete phrase is "Nice to meet you!"',
      },
    ],
  },
  {
    id: 'eng-beginner-2',
    language: 'english',
    level: 'beginner',
    title: 'Numbers and Counting',
    description: 'Learn numbers from 1 to 100',
    vocabulary: [
      {
        id: 'v6',
        word: 'One',
        pronunciation: '/wʌn/',
        meaning: 'หนึ่ง',
        example: 'I have one apple.',
      },
      {
        id: 'v7',
        word: 'Ten',
        pronunciation: '/ten/',
        meaning: 'สิบ',
        example: 'There are ten students.',
      },
      {
        id: 'v8',
        word: 'Twenty',
        pronunciation: '/ˈtwenti/',
        meaning: 'ยี่สิบ',
        example: 'I am twenty years old.',
      },
      {
        id: 'v9',
        word: 'Hundred',
        pronunciation: '/ˈhʌndrəd/',
        meaning: 'ร้อย',
        example: 'One hundred dollars.',
      },
    ],
    quiz: [
      {
        id: 'q4',
        question: 'What comes after nine?',
        type: 'multiple-choice',
        options: ['Eight', 'Ten', 'Eleven', 'Seven'],
        correctAnswer: 'Ten',
      },
      {
        id: 'q5',
        question: 'How do you say "20" in English?',
        type: 'multiple-choice',
        options: ['Twelve', 'Twenty', 'Thirty', 'Forty'],
        correctAnswer: 'Twenty',
      },
    ],
  },
];

export const japaneseLessons: Lesson[] = [
  {
    id: 'jpn-beginner-1',
    language: 'japanese',
    level: 'beginner',
    title: 'Hiragana Basics',
    description: 'Learn basic Hiragana characters',
    vocabulary: [
      {
        id: 'v10',
        word: 'あ (a)',
        pronunciation: 'a',
        meaning: 'สระ อะ',
        example: 'あい (ai) = love',
      },
      {
        id: 'v11',
        word: 'い (i)',
        pronunciation: 'i',
        meaning: 'สระ อิ',
        example: 'いえ (ie) = house',
      },
      {
        id: 'v12',
        word: 'う (u)',
        pronunciation: 'u',
        meaning: 'สระ อุ',
        example: 'うみ (umi) = sea',
      },
      {
        id: 'v13',
        word: 'え (e)',
        pronunciation: 'e',
        meaning: 'สระ เอ',
        example: 'えき (eki) = station',
      },
      {
        id: 'v14',
        word: 'お (o)',
        pronunciation: 'o',
        meaning: 'สระ โอ',
        example: 'おかね (okane) = money',
      },
    ],
    quiz: [
      {
        id: 'q6',
        question: 'What is the pronunciation of "あ"?',
        type: 'multiple-choice',
        options: ['a', 'i', 'u', 'e'],
        correctAnswer: 'a',
      },
      {
        id: 'q7',
        question: 'Which hiragana represents the sound "i"?',
        type: 'multiple-choice',
        options: ['あ', 'い', 'う', 'え'],
        correctAnswer: 'い',
      },
    ],
  },
  {
    id: 'jpn-beginner-2',
    language: 'japanese',
    level: 'beginner',
    title: 'Basic Greetings',
    description: 'Learn common Japanese greetings',
    vocabulary: [
      {
        id: 'v15',
        word: 'こんにちは',
        pronunciation: 'konnichiwa',
        meaning: 'สวัสดี (กลางวัน)',
        example: 'こんにちは、元気ですか？',
      },
      {
        id: 'v16',
        word: 'おはよう',
        pronunciation: 'ohayou',
        meaning: 'สวัสดีตอนเช้า',
        example: 'おはようございます！',
      },
      {
        id: 'v17',
        word: 'ありがとう',
        pronunciation: 'arigatou',
        meaning: 'ขอบคุณ',
        example: 'ありがとうございます。',
      },
      {
        id: 'v18',
        word: 'さようなら',
        pronunciation: 'sayounara',
        meaning: 'ลาก่อน',
        example: 'さようなら、また明日！',
      },
    ],
    quiz: [
      {
        id: 'q8',
        question: 'How do you say "Hello" in Japanese (afternoon)?',
        type: 'multiple-choice',
        options: ['おはよう', 'こんにちは', 'こんばんは', 'さようなら'],
        correctAnswer: 'こんにちは',
      },
      {
        id: 'q9',
        question: 'What does "ありがとう" mean?',
        type: 'multiple-choice',
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        correctAnswer: 'Thank you',
      },
    ],
  },
];

export const allLessons = [...englishLessons, ...japaneseLessons, ...allExtendedLessons];

