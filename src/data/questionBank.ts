// SAKULANG Real Question Bank
// คลังคำถามจริงสำหรับการเรียนภาษา

import type { QuestionBank, MCQ, Typing, Open } from '../types/core';

export const realQuestionBank: QuestionBank = {
  EN: {
    Classic: {
      Beginner: [
        // Basic Greetings & Introductions
        {
          id: 'en-mcq-greet-1',
          type: 'mcq',
          prompt: 'How do you greet someone in the morning?',
          choices: ['Good night', 'Good morning', 'Good evening', 'Good afternoon'],
          answerIndex: 1,
          explanation: 'Good morning is used to greet someone from sunrise until noon.'
        } as MCQ,
        {
          id: 'en-typing-intro-1',
          type: 'typing',
          prompt: 'Complete: "My name __ John."',
          accept: ['is', 'Is'],
          explanation: 'Use "is" with singular subjects like "My name".'
        } as Typing,
        {
          id: 'en-mcq-age-1',
          type: 'mcq',
          prompt: 'Which is correct?',
          choices: ['I have 25 years old', 'I am 25 years old', 'I am 25 years', 'I have 25 years'],
          answerIndex: 1,
          explanation: 'Use "I am [age] years old" to express your age in English.'
        } as MCQ,
        
        // Numbers & Time
        {
          id: 'en-typing-numbers-1',
          type: 'typing',
          prompt: 'Write the number: 15',
          accept: ['fifteen', 'Fifteen'],
          explanation: 'The number 15 is written as "fifteen".'
        } as Typing,
        {
          id: 'en-mcq-time-1',
          type: 'mcq',
          prompt: 'What time is 3:30?',
          choices: ['Three thirty', 'Half past three', 'Thirty past three', 'Both A and B'],
          answerIndex: 3,
          explanation: 'Both "three thirty" and "half past three" are correct ways to say 3:30.'
        } as MCQ,
        
        // Colors & Objects
        {
          id: 'en-typing-colors-1',
          type: 'typing',
          prompt: 'What color do you get when you mix red and yellow?',
          accept: ['orange', 'Orange'],
          explanation: 'Red + Yellow = Orange'
        } as Typing,
        {
          id: 'en-mcq-objects-1',
          type: 'mcq',
          prompt: 'Which one is used for writing?',
          choices: ['Spoon', 'Pen', 'Cup', 'Plate'],
          answerIndex: 1,
          explanation: 'A pen is used for writing.'
        } as MCQ,
        
        // Family & Relationships
        {
          id: 'en-typing-family-1',
          type: 'typing',
          prompt: 'Your mother\'s sister is your ____',
          accept: ['aunt', 'Aunt'],
          explanation: 'Your mother\'s sister is called your aunt.'
        } as Typing,
        {
          id: 'en-open-family-1',
          type: 'open',
          prompt: 'Describe your family in 2-3 sentences.',
          explanation: 'Practice describing family members using simple present tense.',
          rubric: ['Grammar', 'Vocabulary', 'Sentence structure']
        } as Open,
        
        // Food & Drinks
        {
          id: 'en-mcq-food-1',
          type: 'mcq',
          prompt: 'Which is a fruit?',
          choices: ['Carrot', 'Potato', 'Apple', 'Onion'],
          answerIndex: 2,
          explanation: 'An apple is a fruit. The others are vegetables.'
        } as MCQ,
        {
          id: 'en-typing-drinks-1',
          type: 'typing',
          prompt: 'What do you drink when you\'re thirsty?',
          accept: ['water', 'Water', 'juice', 'Juice', 'milk', 'Milk'],
          explanation: 'Common drinks include water, juice, and milk.'
        } as Typing
      ],
      
      Intermediate: [
        // Past Tense
        {
          id: 'en-mcq-past-1',
          type: 'mcq',
          prompt: 'Yesterday, I ____ to the store.',
          choices: ['go', 'went', 'going', 'goes'],
          answerIndex: 1,
          explanation: 'Use "went" (past tense of "go") for actions that happened in the past.'
        } as MCQ,
        {
          id: 'en-typing-past-2',
          type: 'typing',
          prompt: 'Complete: "She ____ her homework last night." (finish)',
          accept: ['finished', 'Finished'],
          explanation: 'The past tense of "finish" is "finished".'
        } as Typing,
        
        // Present Perfect
        {
          id: 'en-mcq-perfect-1',
          type: 'mcq',
          prompt: 'I ____ never ____ to Japan.',
          choices: ['am, go', 'have, been', 'was, going', 'will, go'],
          answerIndex: 1,
          explanation: 'Use "have never been" for experiences you haven\'t had.'
        } as MCQ,
        
        // Comparatives
        {
          id: 'en-typing-compare-1',
          type: 'typing',
          prompt: 'Complete: "This book is ____ than that one." (interesting)',
          accept: ['more interesting', 'More interesting'],
          explanation: 'For adjectives with 3+ syllables, use "more + adjective".'
        } as Typing,
        
        // Conditionals
        {
          id: 'en-mcq-conditional-1',
          type: 'mcq',
          prompt: 'If it rains tomorrow, I ____ stay home.',
          choices: ['will', 'would', 'am', 'was'],
          answerIndex: 0,
          explanation: 'Use "will" in the main clause of first conditional (if + present, will + base verb).'
        } as MCQ,
        
        // Open-ended
        {
          id: 'en-open-travel-1',
          type: 'open',
          prompt: 'Describe a place you would like to visit and explain why.',
          explanation: 'Practice using future tense and giving reasons.',
          rubric: ['Grammar accuracy', 'Vocabulary range', 'Coherence', 'Task completion']
        } as Open
      ],
      
      Advanced: [
        // Advanced Grammar
        {
          id: 'en-mcq-subjunctive-1',
          type: 'mcq',
          prompt: 'I suggest that he ____ more carefully.',
          choices: ['drives', 'drive', 'driving', 'to drive'],
          answerIndex: 1,
          explanation: 'After "suggest that", use the base form of the verb (subjunctive).'
        } as MCQ,
        
        // Phrasal Verbs
        {
          id: 'en-typing-phrasal-1',
          type: 'typing',
          prompt: 'Replace "postpone" with a phrasal verb: "We need to postpone the meeting."',
          accept: ['put off', 'Put off'],
          explanation: '"Put off" means to postpone or delay something.'
        } as Typing,
        
        // Idioms
        {
          id: 'en-mcq-idiom-1',
          type: 'mcq',
          prompt: 'What does "break the ice" mean?',
          choices: ['To literally break ice', 'To start a conversation', 'To be very cold', 'To make someone angry'],
          answerIndex: 1,
          explanation: '"Break the ice" means to start a conversation or make people feel more comfortable.'
        } as MCQ,
        
        // Complex Writing
        {
          id: 'en-open-argument-1',
          type: 'open',
          prompt: 'Write a short argument for or against remote work. Include at least 3 points.',
          explanation: 'Practice argumentative writing with clear structure and supporting evidence.',
          rubric: ['Argument structure', 'Supporting evidence', 'Language complexity', 'Coherence']
        } as Open
      ]
    },
    
    CEFR: {
      A1: [
        {
          id: 'cefr-a1-mcq-1',
          type: 'mcq',
          prompt: 'How do you ask for someone\'s name?',
          choices: ['What your name?', 'What is your name?', 'What are your name?', 'How your name?'],
          answerIndex: 1,
          explanation: 'The correct question form is "What is your name?"'
        } as MCQ,
        {
          id: 'cefr-a1-typing-1',
          type: 'typing',
          prompt: 'Complete: "I ____ from Thailand."',
          accept: ['am', 'Am', 'come', 'Come'],
          explanation: 'You can say "I am from Thailand" or "I come from Thailand".'
        } as Typing
      ],
      
      A2: [
        {
          id: 'cefr-a2-mcq-1',
          type: 'mcq',
          prompt: 'Which sentence is in the past tense?',
          choices: ['I eat breakfast', 'I am eating breakfast', 'I ate breakfast', 'I will eat breakfast'],
          answerIndex: 2,
          explanation: '"I ate breakfast" is in the simple past tense.'
        } as MCQ
      ],
      
      B1: [
        {
          id: 'cefr-b1-open-1',
          type: 'open',
          prompt: 'Describe your daily routine using time expressions.',
          explanation: 'Use present simple tense with time expressions like "first", "then", "after that".',
          rubric: ['Time expressions', 'Present simple accuracy', 'Sequencing']
        } as Open
      ],
      
      B2: [
        {
          id: 'cefr-b2-mcq-1',
          type: 'mcq',
          prompt: 'Choose the most appropriate response: "I\'m thinking of changing jobs."',
          choices: ['That\'s nice', 'Really? What makes you say that?', 'Good for you', 'I don\'t care'],
          answerIndex: 1,
          explanation: 'Asking for more information shows interest and is socially appropriate.'
        } as MCQ
      ],
      
      C1: [
        {
          id: 'cefr-c1-typing-1',
          type: 'typing',
          prompt: 'Complete with an appropriate linking word: "____ the weather was bad, we decided to go hiking."',
          accept: ['Despite', 'Although', 'Even though', 'In spite of'],
          explanation: 'These words show contrast between two clauses.'
        } as Typing
      ],
      
      C2: [
        {
          id: 'cefr-c2-open-1',
          type: 'open',
          prompt: 'Analyze the impact of social media on modern communication, considering both benefits and drawbacks.',
          explanation: 'Demonstrate advanced analytical skills and sophisticated language use.',
          rubric: ['Analysis depth', 'Language sophistication', 'Argument balance', 'Critical thinking']
        } as Open
      ]
    },
    
    JLPT: {
      N5: [
        {
          id: 'jlpt-n5-mcq-1',
          type: 'mcq',
          prompt: 'How do you say "Good morning" in Japanese?',
          choices: ['こんばんは', 'おはよう', 'こんにちは', 'さようなら'],
          answerIndex: 1,
          explanation: 'おはよう (ohayou) means "good morning" in casual Japanese.'
        } as MCQ,
        {
          id: 'jlpt-n5-typing-1',
          type: 'typing',
          prompt: 'Write "thank you" in hiragana:',
          accept: ['ありがとう', 'アリガトウ'],
          explanation: 'ありがとう (arigatou) means "thank you".'
        } as Typing
      ],
      
      N4: [
        {
          id: 'jlpt-n4-mcq-1',
          type: 'mcq',
          prompt: '昨日、友達と映画を＿＿。',
          choices: ['見ました', '見ます', '見る', '見て'],
          answerIndex: 0,
          explanation: '見ました is the past tense polite form of "to see/watch".'
        } as MCQ
      ],
      
      N3: [
        {
          id: 'jlpt-n3-typing-1',
          type: 'typing',
          prompt: 'Complete: 雨が降っているので、傘を＿＿。',
          accept: ['持ちます', '持って行きます', 'さします'],
          explanation: 'When it\'s raining, you bring/hold an umbrella.'
        } as Typing
      ],
      
      N2: [
        {
          id: 'jlpt-n2-mcq-1',
          type: 'mcq',
          prompt: '彼は忙しい＿＿、手伝ってくれた。',
          choices: ['ので', 'のに', 'から', 'ため'],
          answerIndex: 1,
          explanation: 'のに expresses contrast: "Even though he was busy, he helped me."'
        } as MCQ
      ],
      
      N1: [
        {
          id: 'jlpt-n1-open-1',
          type: 'open',
          prompt: '現代社会における技術の役割について、あなたの意見を述べてください。',
          explanation: 'Express your opinion about technology\'s role in modern society using advanced Japanese.',
          rubric: ['Grammar complexity', 'Vocabulary sophistication', 'Argument structure', 'Cultural awareness']
        } as Open
      ]
    }
  },
  
  JP: {
    Classic: {
      Beginner: [
        {
          id: 'jp-mcq-hiragana-1',
          type: 'mcq',
          prompt: 'Which hiragana represents the sound "ka"?',
          choices: ['か', 'き', 'く', 'け'],
          answerIndex: 0,
          explanation: 'か (ka) is the hiragana character for the "ka" sound.'
        } as MCQ,
        {
          id: 'jp-typing-katakana-1',
          type: 'typing',
          prompt: 'Write "coffee" in katakana:',
          accept: ['コーヒー'],
          explanation: 'コーヒー (koohii) is "coffee" in katakana.'
        } as Typing,
        {
          id: 'jp-mcq-numbers-1',
          type: 'mcq',
          prompt: 'How do you say "3" in Japanese?',
          choices: ['いち', 'に', 'さん', 'よん'],
          answerIndex: 2,
          explanation: 'さん (san) means "three" in Japanese.'
        } as MCQ
      ],
      
      Intermediate: [
        {
          id: 'jp-mcq-keigo-1',
          type: 'mcq',
          prompt: 'Which is the most polite way to say "to eat"?',
          choices: ['食べる', '食べます', 'いただく', 'めしあがる'],
          answerIndex: 3,
          explanation: 'めしあがる is the most respectful (sonkeigo) form meaning "to eat".'
        } as MCQ,
        {
          id: 'jp-typing-particles-1',
          type: 'typing',
          prompt: 'Complete: 学校＿＿行きます。(to school)',
          accept: ['に', 'へ'],
          explanation: 'Both に and へ can indicate direction "to school".'
        } as Typing
      ],
      
      Advanced: [
        {
          id: 'jp-open-culture-1',
          type: 'open',
          prompt: '日本の季節の変化について、あなたの経験や感想を書いてください。',
          explanation: 'Write about seasonal changes in Japan using advanced expressions.',
          rubric: ['Cultural understanding', 'Language sophistication', 'Personal reflection', 'Grammar accuracy']
        } as Open
      ]
    },
    
    CEFR: {
      A1: [
        {
          id: 'jp-cefr-a1-mcq-1',
          type: 'mcq',
          prompt: 'How do you introduce yourself in Japanese?',
          choices: ['私は田中です', '田中さんです', 'これは田中です', '田中と申します'],
          answerIndex: 0,
          explanation: '私は田中です (Watashi wa Tanaka desu) means "I am Tanaka".'
        } as MCQ
      ],
      
      A2: [],
      B1: [],
      B2: [],
      C1: [],
      C2: []
    },
    
    JLPT: {
      N5: [
        {
          id: 'jp-jlpt-n5-mcq-1',
          type: 'mcq',
          prompt: '今日は＿＿です。',
          choices: ['月曜日', '火曜日', '水曜日', '木曜日'],
          answerIndex: 0,
          explanation: 'This tests knowledge of days of the week. 月曜日 (getsuyoubi) means Monday.'
        } as MCQ
      ],
      
      N4: [],
      N3: [],
      N2: [],
      N1: []
    }
  }
};