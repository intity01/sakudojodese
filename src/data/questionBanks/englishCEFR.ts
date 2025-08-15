// English CEFR Question Bank
import type { MCQ, Typing, Open } from '../../types/core';

// A1 Level (Beginner)
export const englishCEFRA1: (MCQ | Typing | Open)[] = [
  // Basic Personal Information
  {
    id: 'en-cefr-a1-001',
    type: 'mcq',
    prompt: 'How do you ask someone\'s name?',
    choices: ['What your name?', 'What is your name?', 'What are your name?', 'How your name?'],
    answerIndex: 1,
    explanation: 'The correct question form is "What is your name?" using the verb "to be".'
  },
  
  // Numbers and Age
  {
    id: 'en-cefr-a1-002',
    type: 'typing',
    prompt: 'Write your age using "I am ___ years old":',
    accept: ['I am 20 years old', 'I am 25 years old', 'I am thirty years old', 'I am eighteen years old'],
    explanation: 'Use "I am [number] years old" to state your age.'
  },
  
  // Basic Vocabulary - Family
  {
    id: 'en-cefr-a1-003',
    type: 'mcq',
    prompt: 'What do you call your father\'s brother?',
    choices: ['cousin', 'uncle', 'nephew', 'grandfather'],
    answerIndex: 1,
    explanation: 'Your father\'s brother is your uncle.'
  },
  
  // Present Simple - Daily Activities
  {
    id: 'en-cefr-a1-004',
    type: 'mcq',
    prompt: 'Complete: "I ___ breakfast at 7 AM."',
    choices: ['eat', 'eats', 'eating', 'ate'],
    answerIndex: 0,
    explanation: 'Use "eat" (base form) with "I" in present simple tense.'
  },
  
  // Basic Directions
  {
    id: 'en-cefr-a1-005',
    type: 'typing',
    prompt: 'How do you say "ขวา" in English?',
    accept: ['right', 'Right'],
    explanation: 'ขวา means "right" in English (direction).'
  }
];

// A2 Level (Elementary)
export const englishCEFRA2: (MCQ | Typing | Open)[] = [
  // Past Simple
  {
    id: 'en-cefr-a2-001',
    type: 'mcq',
    prompt: 'Complete: "Yesterday, I ___ to the cinema."',
    choices: ['go', 'went', 'going', 'gone'],
    answerIndex: 1,
    explanation: 'Use "went" (past simple) for completed actions in the past.'
  },
  
  // Comparatives
  {
    id: 'en-cefr-a2-002',
    type: 'mcq',
    prompt: 'Complete: "This book is ___ than that one."',
    choices: ['more interesting', 'most interesting', 'interesting', 'interestinger'],
    answerIndex: 0,
    explanation: 'Use "more + adjective" for comparatives with long adjectives.'
  },
  
  // Future Plans
  {
    id: 'en-cefr-a2-003',
    type: 'typing',
    prompt: 'Complete: "I ___ visit my grandmother next week." (future plan)',
    accept: ['am going to', 'will', 'plan to'],
    explanation: 'Use "am going to", "will", or "plan to" to express future intentions.'
  },
  
  // Shopping and Money
  {
    id: 'en-cefr-a2-004',
    type: 'mcq',
    prompt: 'How much does this cost?',
    choices: ['It costs $10', 'It cost $10', 'It costing $10', 'It will cost $10'],
    answerIndex: 0,
    explanation: 'Use "It costs" (present simple) to state current prices.'
  },
  
  // Describing People
  {
    id: 'en-cefr-a2-005',
    type: 'open',
    prompt: 'Describe your best friend. What do they look like? What do they like to do?',
    explanation: 'Practice describing physical appearance and personality using present simple tense.'
  }
];

// B1 Level (Intermediate)
export const englishCEFRB1: (MCQ | Typing | Open)[] = [
  // Present Perfect
  {
    id: 'en-cefr-b1-001',
    type: 'mcq',
    prompt: 'Complete: "I ___ to Paris three times."',
    choices: ['went', 'have been', 'was', 'go'],
    answerIndex: 1,
    explanation: 'Use present perfect "have been" for life experiences without specific time.'
  },
  
  // Modal Verbs
  {
    id: 'en-cefr-b1-002',
    type: 'mcq',
    prompt: 'Complete: "You ___ wear a helmet when riding a motorcycle."',
    choices: ['can', 'should', 'might', 'would'],
    answerIndex: 1,
    explanation: 'Use "should" to give advice or express obligation.'
  },
  
  // Conditional Sentences
  {
    id: 'en-cefr-b1-003',
    type: 'typing',
    prompt: 'Complete the first conditional: "If it rains, I _____ stay home."',
    accept: ['will', 'will stay', 'am going to'],
    explanation: 'Use "will" in the main clause of first conditional sentences.'
  },
  
  // Expressing Opinions
  {
    id: 'en-cefr-b1-004',
    type: 'open',
    prompt: 'What is your opinion about online learning? Give reasons for your answer.',
    explanation: 'Practice expressing and supporting opinions using appropriate linking words and examples.'
  },
  
  // Passive Voice
  {
    id: 'en-cefr-b1-005',
    type: 'mcq',
    prompt: 'Change to passive: "They built this house in 1990."',
    choices: ['This house built in 1990', 'This house was built in 1990', 'This house is built in 1990', 'This house has built in 1990'],
    answerIndex: 1,
    explanation: 'Use "was built" (past simple passive) for completed actions in the past.'
  }
];

// B2 Level (Upper-Intermediate)
export const englishCEFRB2: (MCQ | Typing | Open)[] = [
  // Advanced Grammar
  {
    id: 'en-cefr-b2-001',
    type: 'mcq',
    prompt: 'Complete: "I wish I ___ more time to study."',
    choices: ['have', 'had', 'would have', 'will have'],
    answerIndex: 1,
    explanation: 'Use past simple "had" after "I wish" to express regret about present situations.'
  },
  
  // Reported Speech
  {
    id: 'en-cefr-b2-002',
    type: 'mcq',
    prompt: 'Report: She said, "I am tired." → She said that she ___ tired.',
    choices: ['is', 'was', 'has been', 'will be'],
    answerIndex: 1,
    explanation: 'Change present tense to past tense in reported speech when the reporting verb is past.'
  },
  
  // Advanced Vocabulary
  {
    id: 'en-cefr-b2-003',
    type: 'typing',
    prompt: 'What word means "to make something better or improve it"?',
    accept: ['enhance', 'improve', 'upgrade', 'refine', 'optimize'],
    explanation: 'Words like "enhance", "improve", "upgrade", "refine", and "optimize" mean to make something better.'
  },
  
  // Complex Ideas
  {
    id: 'en-cefr-b2-004',
    type: 'open',
    prompt: 'Discuss the impact of technology on traditional forms of communication. Consider both positive and negative aspects.',
    explanation: 'Practice discussing complex topics with balanced arguments and sophisticated language.'
  },
  
  // Phrasal Verbs
  {
    id: 'en-cefr-b2-005',
    type: 'mcq',
    prompt: 'What does "put off" mean in: "We had to put off the meeting"?',
    choices: ['cancel', 'postpone', 'attend', 'organize'],
    answerIndex: 1,
    explanation: '"Put off" means to postpone or delay something to a later time.'
  }
];

// C1 Level (Advanced)
export const englishCEFRC1: (MCQ | Typing | Open)[] = [
  // Sophisticated Grammar
  {
    id: 'en-cefr-c1-001',
    type: 'mcq',
    prompt: 'Complete: "___ the weather been better, we would have gone hiking."',
    choices: ['If', 'Had', 'Should', 'Were'],
    answerIndex: 1,
    explanation: 'Use "Had" for inverted third conditional (Had + subject + past participle).'
  },
  
  // Academic Language
  {
    id: 'en-cefr-c1-002',
    type: 'typing',
    prompt: 'What formal word means "to examine something carefully and in detail"?',
    accept: ['analyze', 'analyse', 'scrutinize', 'examine', 'investigate'],
    explanation: 'Academic words like "analyze", "scrutinize", and "investigate" mean to examine carefully.'
  },
  
  // Complex Argumentation
  {
    id: 'en-cefr-c1-003',
    type: 'open',
    prompt: 'Evaluate the effectiveness of international cooperation in addressing global challenges such as climate change.',
    explanation: 'Practice advanced critical thinking, evaluation, and sophisticated argumentation structures.'
  },
  
  // Nuanced Language
  {
    id: 'en-cefr-c1-004',
    type: 'mcq',
    prompt: 'Choose the most appropriate word: "The evidence ___ supports the hypothesis."',
    choices: ['strongly', 'hardly', 'barely', 'scarcely'],
    answerIndex: 0,
    explanation: '"Strongly supports" indicates robust evidence, while the others suggest weak support.'
  },
  
  // Abstract Concepts
  {
    id: 'en-cefr-c1-005',
    type: 'open',
    prompt: 'Analyze the relationship between individual freedom and social responsibility in democratic societies.',
    explanation: 'Engage with abstract philosophical concepts using sophisticated language and reasoning.'
  }
];

// C2 Level (Proficiency)
export const englishCEFRC2: (MCQ | Typing | Open)[] = [
  // Native-like Proficiency
  {
    id: 'en-cefr-c2-001',
    type: 'mcq',
    prompt: 'Choose the most natural expression: "The proposal was met with ___."',
    choices: ['skeptical reception', 'skepticism', 'skeptical responses', 'skeptical reactions'],
    answerIndex: 1,
    explanation: '"Met with skepticism" is the most natural and idiomatic expression.'
  },
  
  // Subtle Distinctions
  {
    id: 'en-cefr-c2-002',
    type: 'mcq',
    prompt: 'Distinguish: "The politician\'s statement was ___" (suggesting deliberate deception)',
    choices: ['misleading', 'confusing', 'unclear', 'ambiguous'],
    answerIndex: 0,
    explanation: '"Misleading" specifically implies intentional deception, while others suggest unintentional confusion.'
  },
  
  // Literary Analysis
  {
    id: 'en-cefr-c2-003',
    type: 'typing',
    prompt: 'What literary term describes the use of "crown" to represent monarchy?',
    accept: ['metonymy', 'synecdoche'],
    explanation: 'Metonymy (or synecdoche) substitutes something closely associated with the thing being referenced.'
  },
  
  // Expert-level Discourse
  {
    id: 'en-cefr-c2-004',
    type: 'open',
    prompt: 'Critically examine the epistemological foundations of scientific knowledge and their implications for understanding reality.',
    explanation: 'Demonstrate mastery of complex philosophical discourse and sophisticated analytical thinking.'
  },
  
  // Cultural Nuances
  {
    id: 'en-cefr-c2-005',
    type: 'open',
    prompt: 'Discuss how cultural context influences the interpretation of literary works, using specific examples.',
    explanation: 'Show deep understanding of cultural nuances and their impact on meaning and interpretation.'
  }
];