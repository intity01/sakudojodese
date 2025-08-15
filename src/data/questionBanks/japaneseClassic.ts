// Japanese Classic Question Bank
import type { MCQ, Typing, Open } from '../../types/core';

// Beginner Level Questions
export const japaneseClassicBeginner: (MCQ | Typing | Open)[] = [
  // Basic Greetings
  {
    id: 'jp-classic-beg-001',
    type: 'mcq',
    prompt: 'What does "おはよう" mean?',
    choices: ['Good evening', 'Good morning', 'Good afternoon', 'Good night'],
    answerIndex: 1,
    explanation: 'おはよう (ohayou) means "good morning" in casual Japanese.'
  },
  {
    id: 'jp-classic-beg-002',
    type: 'mcq',
    prompt: 'What does "こんにちは" mean?',
    choices: ['Good morning', 'Good afternoon/Hello', 'Good evening', 'Goodbye'],
    answerIndex: 1,
    explanation: 'こんにちは (konnichiwa) means "good afternoon" or general "hello".'
  },
  
  // Basic Hiragana
  {
    id: 'jp-classic-beg-003',
    type: 'mcq',
    prompt: 'Which hiragana represents the sound "ka"?',
    choices: ['か', 'き', 'く', 'け'],
    answerIndex: 0,
    explanation: 'か (ka) is the hiragana character for the "ka" sound.'
  },
  {
    id: 'jp-classic-beg-004',
    type: 'mcq',
    prompt: 'Which hiragana represents the sound "su"?',
    choices: ['さ', 'し', 'す', 'せ'],
    answerIndex: 2,
    explanation: 'す (su) is the hiragana character for the "su" sound.'
  },
  
  // Basic Vocabulary
  {
    id: 'jp-classic-beg-005',
    type: 'typing',
    prompt: 'Type "thank you" in Japanese (hiragana):',
    accept: ['ありがとう', 'ありがとうございます'],
    explanation: 'ありがとう (arigatou) or ありがとうございます (arigatou gozaimasu) means "thank you".'
  },
  {
    id: 'jp-classic-beg-006',
    type: 'typing',
    prompt: 'Type "excuse me" in Japanese (hiragana):',
    accept: ['すみません', 'すいません'],
    explanation: 'すみません (sumimasen) means "excuse me" or "sorry".'
  },
  
  // Numbers
  {
    id: 'jp-classic-beg-007',
    type: 'mcq',
    prompt: 'How do you say "3" in Japanese?',
    choices: ['に', 'さん', 'よん', 'ご'],
    answerIndex: 1,
    explanation: 'さん (san) means "three" in Japanese.'
  },
  {
    id: 'jp-classic-beg-008',
    type: 'mcq',
    prompt: 'How do you say "5" in Japanese?',
    choices: ['よん', 'ご', 'ろく', 'なな'],
    answerIndex: 1,
    explanation: 'ご (go) means "five" in Japanese.'
  },
  
  // Basic Particles
  {
    id: 'jp-classic-beg-009',
    type: 'mcq',
    prompt: 'Which particle marks the topic of a sentence?',
    choices: ['を', 'に', 'は', 'が'],
    answerIndex: 2,
    explanation: 'は (wa) is the topic particle in Japanese, though written with は.'
  },
  
  // Self-Introduction
  {
    id: 'jp-classic-beg-010',
    type: 'open',
    prompt: 'Introduce yourself in Japanese. Include your name and nationality.',
    explanation: 'Practice basic self-introduction using わたしは (watashi wa) and です (desu).'
  }
];

// Intermediate Level Questions
export const japaneseClassicIntermediate: (MCQ | Typing | Open)[] = [
  // Katakana
  {
    id: 'jp-classic-int-001',
    type: 'mcq',
    prompt: 'Which katakana represents the sound "ko"?',
    choices: ['カ', 'キ', 'ク', 'コ'],
    answerIndex: 3,
    explanation: 'コ (ko) is the katakana character for the "ko" sound.'
  },
  
  // Verb Conjugation - Present/Past
  {
    id: 'jp-classic-int-002',
    type: 'mcq',
    prompt: 'What is the past tense of "たべます" (to eat)?',
    choices: ['たべました', 'たべる', 'たべて', 'たべない'],
    answerIndex: 0,
    explanation: 'たべました (tabemashita) is the polite past tense of "to eat".'
  },
  {
    id: 'jp-classic-int-003',
    type: 'mcq',
    prompt: 'What is the negative form of "いきます" (to go)?',
    choices: ['いきました', 'いかない', 'いきません', 'いって'],
    answerIndex: 2,
    explanation: 'いきません (ikimasen) is the polite negative form of "to go".'
  },
  
  // Adjectives
  {
    id: 'jp-classic-int-004',
    type: 'mcq',
    prompt: 'How do you say "This book is interesting"?',
    choices: ['この本はおもしろいです', 'この本はおもしろかったです', 'この本はおもしろくないです', 'この本はおもしろくありません'],
    answerIndex: 0,
    explanation: 'この本はおもしろいです (kono hon wa omoshiroi desu) means "This book is interesting".'
  },
  
  // Time Expressions
  {
    id: 'jp-classic-int-005',
    type: 'typing',
    prompt: 'How do you say "yesterday" in Japanese?',
    accept: ['きのう', '昨日'],
    explanation: 'きのう (kinou) means "yesterday" in Japanese.'
  },
  {
    id: 'jp-classic-int-006',
    type: 'typing',
    prompt: 'How do you say "tomorrow" in Japanese?',
    accept: ['あした', 'あす', '明日'],
    explanation: 'あした (ashita) or あす (asu) means "tomorrow" in Japanese.'
  },
  
  // Counters
  {
    id: 'jp-classic-int-007',
    type: 'mcq',
    prompt: 'How do you count "3 people"?',
    choices: ['さんにん', 'さんこ', 'さんまい', 'さんぼん'],
    answerIndex: 0,
    explanation: 'さんにん (san-nin) is used to count three people. にん is the counter for people.'
  },
  
  // Describing Daily Activities
  {
    id: 'jp-classic-int-008',
    type: 'open',
    prompt: 'Describe your daily routine in Japanese. What time do you wake up? What do you eat for breakfast?',
    explanation: 'Practice using time expressions, daily activity verbs, and polite forms in Japanese.'
  }
];

// Advanced Level Questions
export const japaneseClassicAdvanced: (MCQ | Typing | Open)[] = [
  // Keigo (Honorific Language)
  {
    id: 'jp-classic-adv-001',
    type: 'mcq',
    prompt: 'What is the honorific form of "いる" (to be/exist)?',
    choices: ['います', 'いらっしゃいます', 'おります', 'ございます'],
    answerIndex: 1,
    explanation: 'いらっしゃいます (irasshaimasu) is the honorific form of いる, used for others.'
  },
  {
    id: 'jp-classic-adv-002',
    type: 'mcq',
    prompt: 'What is the humble form of "いう" (to say)?',
    choices: ['おっしゃいます', 'もうします', 'いいます', 'はなします'],
    answerIndex: 1,
    explanation: 'もうします (moushimasu) is the humble form of いう, used when speaking about oneself.'
  },
  
  // Complex Grammar
  {
    id: 'jp-classic-adv-003',
    type: 'mcq',
    prompt: 'Complete: "雨が降っている___、出かけません。" (Because it\'s raining, I won\'t go out)',
    choices: ['ので', 'から', 'ために', 'のに'],
    answerIndex: 0,
    explanation: 'ので (node) is used to express reason/cause in a more objective way.'
  },
  
  // Conditional Forms
  {
    id: 'jp-classic-adv-004',
    type: 'mcq',
    prompt: 'Which conditional form expresses "If you study, you will pass"?',
    choices: ['勉強すれば、合格します', '勉強したら、合格します', '勉強すると、合格します', 'All of the above'],
    answerIndex: 3,
    explanation: 'All three forms (ば, たら, と) can express conditional "if" in different contexts.'
  },
  
  // Advanced Vocabulary
  {
    id: 'jp-classic-adv-005',
    type: 'typing',
    prompt: 'What is the Japanese word for "environment"?',
    accept: ['かんきょう', '環境'],
    explanation: 'かんきょう (kankyou) means "environment" in Japanese.'
  },
  
  // Cultural Topics
  {
    id: 'jp-classic-adv-006',
    type: 'open',
    prompt: 'Explain the concept of "おもてなし" (omotenashi) and its importance in Japanese culture.',
    explanation: 'Practice discussing cultural concepts using advanced Japanese vocabulary and expressions.'
  },
  
  // Business Japanese
  {
    id: 'jp-classic-adv-007',
    type: 'mcq',
    prompt: 'How do you politely say "I received your email" in business Japanese?',
    choices: ['メールをもらいました', 'メールをいただきました', 'メールを受けました', 'メールがきました'],
    answerIndex: 1,
    explanation: 'いただきました is the humble form, appropriate for business communication.'
  }
];

// Expert Level Questions
export const japaneseClassicExpert: (MCQ | Typing | Open)[] = [
  // Classical Japanese
  {
    id: 'jp-classic-exp-001',
    type: 'mcq',
    prompt: 'In classical Japanese, what does "けり" indicate?',
    choices: ['Past tense', 'Realization/Discovery', 'Probability', 'Respect'],
    answerIndex: 1,
    explanation: 'けり (keri) in classical Japanese indicates realization or discovery of a past state.'
  },
  
  // Advanced Kanji
  {
    id: 'jp-classic-exp-002',
    type: 'typing',
    prompt: 'What is the reading of 憂鬱 (depression/melancholy)?',
    accept: ['ゆううつ', 'yuuutsu'],
    explanation: '憂鬱 is read as ゆううつ (yuuutsu) meaning depression or melancholy.'
  },
  
  // Literary Analysis
  {
    id: 'jp-classic-exp-003',
    type: 'open',
    prompt: 'Analyze the use of seasonal imagery (季語) in traditional Japanese poetry and its cultural significance.',
    explanation: 'Demonstrate deep understanding of Japanese literary traditions and cultural symbolism.'
  },
  
  // Dialectal Variations
  {
    id: 'jp-classic-exp-004',
    type: 'mcq',
    prompt: 'In Kansai dialect, how do you say "だめ" (no good/useless)?',
    choices: ['あかん', 'いかん', 'だちかん', 'なんば'],
    answerIndex: 0,
    explanation: 'あかん (akan) is the Kansai dialect equivalent of だめ (dame).'
  },
  
  // Philosophical Concepts
  {
    id: 'jp-classic-exp-005',
    type: 'open',
    prompt: 'Discuss the concept of "間" (ma) in Japanese aesthetics and its manifestation in various art forms.',
    explanation: 'Explore complex philosophical and aesthetic concepts unique to Japanese culture.'
  }
];