// English Classic Question Bank
import type { MCQ, Typing, Open } from '../../types/core';

// Beginner Level Questions
export const englishClassicBeginner: (MCQ | Typing | Open)[] = [
  // Basic Grammar - Articles
  {
    id: 'en-classic-beg-001',
    type: 'mcq',
    prompt: 'Choose the correct article: "I saw ___ elephant at the zoo."',
    choices: ['a', 'an', 'the', 'no article'],
    answerIndex: 1,
    explanation: 'Use "an" before words starting with vowel sounds. "Elephant" starts with a vowel sound.'
  },
  {
    id: 'en-classic-beg-002',
    type: 'mcq',
    prompt: 'Choose the correct article: "___ sun is bright today."',
    choices: ['A', 'An', 'The', 'No article'],
    answerIndex: 2,
    explanation: 'Use "the" with unique objects like the sun, moon, earth.'
  },
  
  // Basic Vocabulary
  {
    id: 'en-classic-beg-003',
    type: 'typing',
    prompt: 'Type the English word for "สวัสดี":',
    accept: ['hello', 'hi', 'Hello', 'Hi'],
    explanation: 'สวัสดี means "hello" or "hi" in English.'
  },
  {
    id: 'en-classic-beg-004',
    type: 'typing',
    prompt: 'Type the English word for "ขอบคุณ":',
    accept: ['thank you', 'thanks', 'Thank you', 'Thanks'],
    explanation: 'ขอบคุณ means "thank you" or "thanks" in English.'
  },
  
  // Simple Present Tense
  {
    id: 'en-classic-beg-005',
    type: 'mcq',
    prompt: 'Choose the correct form: "She ___ to school every day."',
    choices: ['go', 'goes', 'going', 'gone'],
    answerIndex: 1,
    explanation: 'Use "goes" with third person singular (he/she/it) in simple present tense.'
  },
  {
    id: 'en-classic-beg-006',
    type: 'mcq',
    prompt: 'Choose the correct form: "They ___ English every morning."',
    choices: ['study', 'studies', 'studying', 'studied'],
    answerIndex: 0,
    explanation: 'Use base form "study" with plural subjects (they/we/you) in simple present tense.'
  },
  
  // Basic Questions
  {
    id: 'en-classic-beg-007',
    type: 'mcq',
    prompt: 'Choose the correct question: "_____ your name?"',
    choices: ['What', 'What is', 'What are', 'What do'],
    answerIndex: 1,
    explanation: 'Use "What is" to ask about someone\'s name.'
  },
  
  // Open-ended Questions
  {
    id: 'en-classic-beg-008',
    type: 'open',
    prompt: 'Introduce yourself in 2-3 sentences. Include your name and one thing you like.',
    explanation: 'Practice basic self-introduction using simple present tense and personal information.'
  },
  {
    id: 'en-classic-beg-009',
    type: 'open',
    prompt: 'Describe your daily routine. What do you do in the morning?',
    explanation: 'Practice using simple present tense to describe habitual actions.'
  },
  
  // Numbers and Time
  {
    id: 'en-classic-beg-010',
    type: 'typing',
    prompt: 'Write the number "15" in words:',
    accept: ['fifteen', 'Fifteen'],
    explanation: 'The number 15 is written as "fifteen".'
  }
];

// Intermediate Level Questions
export const englishClassicIntermediate: (MCQ | Typing | Open)[] = [
  // Past Tense
  {
    id: 'en-classic-int-001',
    type: 'mcq',
    prompt: 'Choose the correct past tense: "Yesterday, I ___ to the market."',
    choices: ['go', 'went', 'gone', 'going'],
    answerIndex: 1,
    explanation: 'The past tense of "go" is "went".'
  },
  {
    id: 'en-classic-int-002',
    type: 'mcq',
    prompt: 'Choose the correct form: "She ___ her homework before dinner."',
    choices: ['finish', 'finished', 'finishing', 'finishes'],
    answerIndex: 1,
    explanation: 'Use past tense "finished" for completed actions in the past.'
  },
  
  // Present Perfect
  {
    id: 'en-classic-int-003',
    type: 'mcq',
    prompt: 'Choose the correct form: "I ___ never ___ to Japan."',
    choices: ['have / been', 'has / been', 'had / been', 'am / been'],
    answerIndex: 0,
    explanation: 'Use "have been" with first person (I) in present perfect tense.'
  },
  
  // Conditionals
  {
    id: 'en-classic-int-004',
    type: 'mcq',
    prompt: 'Complete the sentence: "If it rains tomorrow, I ___ stay home."',
    choices: ['will', 'would', 'can', 'should'],
    answerIndex: 0,
    explanation: 'Use "will" in the main clause of first conditional (if + present, will + base form).'
  },
  
  // Vocabulary - Intermediate
  {
    id: 'en-classic-int-005',
    type: 'typing',
    prompt: 'Type a synonym for "happy":',
    accept: ['joyful', 'cheerful', 'glad', 'pleased', 'delighted', 'content'],
    explanation: 'Common synonyms for "happy" include joyful, cheerful, glad, pleased, delighted, and content.'
  },
  
  // Prepositions
  {
    id: 'en-classic-int-006',
    type: 'mcq',
    prompt: 'Choose the correct preposition: "The meeting is ___ 3 PM."',
    choices: ['in', 'on', 'at', 'by'],
    answerIndex: 2,
    explanation: 'Use "at" with specific times (3 PM, noon, midnight).'
  },
  
  // Open-ended - Intermediate
  {
    id: 'en-classic-int-007',
    type: 'open',
    prompt: 'Describe a memorable experience from your childhood. Use past tense.',
    explanation: 'Practice using past tense forms and descriptive language to narrate personal experiences.'
  },
  {
    id: 'en-classic-int-008',
    type: 'open',
    prompt: 'What would you do if you won the lottery? Explain your plans.',
    explanation: 'Practice using conditional structures (would + base form) to express hypothetical situations.'
  }
];

// Advanced Level Questions
export const englishClassicAdvanced: (MCQ | Typing | Open)[] = [
  // Advanced Grammar
  {
    id: 'en-classic-adv-001',
    type: 'mcq',
    prompt: 'Choose the correct form: "By the time you arrive, I ___ the report."',
    choices: ['will finish', 'will have finished', 'would finish', 'had finished'],
    answerIndex: 1,
    explanation: 'Use future perfect "will have finished" for actions completed before a future time.'
  },
  
  // Subjunctive Mood
  {
    id: 'en-classic-adv-002',
    type: 'mcq',
    prompt: 'Choose the correct form: "I suggest that he ___ more carefully."',
    choices: ['drives', 'drive', 'drove', 'driven'],
    answerIndex: 1,
    explanation: 'Use base form "drive" after "suggest that" (subjunctive mood).'
  },
  
  // Advanced Vocabulary
  {
    id: 'en-classic-adv-003',
    type: 'typing',
    prompt: 'Type a word meaning "to make something less severe":',
    accept: ['mitigate', 'alleviate', 'diminish', 'reduce', 'lessen'],
    explanation: 'Words like "mitigate" and "alleviate" mean to make something less severe or intense.'
  },
  
  // Idiomatic Expressions
  {
    id: 'en-classic-adv-004',
    type: 'mcq',
    prompt: 'What does "break the ice" mean?',
    choices: ['To damage something', 'To start a conversation', 'To be very cold', 'To work hard'],
    answerIndex: 1,
    explanation: '"Break the ice" is an idiom meaning to start a conversation or make people feel comfortable.'
  },
  
  // Complex Sentences
  {
    id: 'en-classic-adv-005',
    type: 'open',
    prompt: 'Analyze the advantages and disadvantages of social media in modern society.',
    explanation: 'Practice advanced argumentation, complex sentence structures, and analytical thinking.'
  },
  
  // Academic Writing
  {
    id: 'en-classic-adv-006',
    type: 'open',
    prompt: 'Write a thesis statement for an essay about climate change solutions.',
    explanation: 'Practice academic writing skills and creating clear, arguable thesis statements.'
  }
];

// Expert Level Questions
export const englishClassicExpert: (MCQ | Typing | Open)[] = [
  // Nuanced Grammar
  {
    id: 'en-classic-exp-001',
    type: 'mcq',
    prompt: 'Choose the most appropriate form: "The committee ___ on the proposal for hours."',
    choices: ['has been deliberating', 'have been deliberating', 'is deliberating', 'are deliberating'],
    answerIndex: 0,
    explanation: 'Collective nouns like "committee" can take singular verbs when acting as a unit.'
  },
  
  // Literary Analysis
  {
    id: 'en-classic-exp-002',
    type: 'mcq',
    prompt: 'In the phrase "the pen is mightier than the sword," what literary device is used?',
    choices: ['Simile', 'Metaphor', 'Metonymy', 'Hyperbole'],
    answerIndex: 2,
    explanation: 'Metonymy substitutes the name of something with something closely associated (pen = writing, sword = violence).'
  },
  
  // Advanced Vocabulary
  {
    id: 'en-classic-exp-003',
    type: 'typing',
    prompt: 'Type a word meaning "existing in name only, not in reality":',
    accept: ['nominal', 'titular', 'ostensible', 'purported'],
    explanation: 'Words like "nominal" and "titular" describe something that exists in name only.'
  },
  
  // Critical Analysis
  {
    id: 'en-classic-exp-004',
    type: 'open',
    prompt: 'Critically evaluate the role of artificial intelligence in shaping future educational paradigms.',
    explanation: 'Practice expert-level critical thinking, complex argumentation, and sophisticated vocabulary.'
  },
  
  // Philosophical Discussion
  {
    id: 'en-classic-exp-005',
    type: 'open',
    prompt: 'Discuss the ethical implications of genetic engineering in human enhancement.',
    explanation: 'Engage with complex ethical reasoning and advanced discourse structures.'
  }
];