// Japanese JLPT Question Bank
import type { MCQ, Typing, Open } from '../../types/core';

// N5 Level (Beginner)
export const japaneseJLPTN5: (MCQ | Typing | Open)[] = [
  // Basic Hiragana/Katakana
  {
    id: 'jp-jlpt-n5-001',
    type: 'mcq',
    prompt: 'Choose the correct reading: 学生',
    choices: ['がくせい', 'がくしょう', 'がっこう', 'せんせい'],
    answerIndex: 0,
    explanation: '学生 is read as がくせい (gakusei) meaning "student".'
  },
  {
    id: 'jp-jlpt-n5-002',
    type: 'mcq',
    prompt: 'Choose the correct reading: 先生',
    choices: ['がくせい', 'せんせい', 'せんぱい', 'こうはい'],
    answerIndex: 1,
    explanation: '先生 is read as せんせい (sensei) meaning "teacher".'
  },
  
  // Basic Grammar - Particles
  {
    id: 'jp-jlpt-n5-003',
    type: 'mcq',
    prompt: 'Fill in the particle: 私___学生です。',
    choices: ['は', 'が', 'を', 'に'],
    answerIndex: 0,
    explanation: 'は (wa) is the topic particle. 私は学生です means "I am a student".'
  },
  {
    id: 'jp-jlpt-n5-004',
    type: 'mcq',
    prompt: 'Fill in the particle: 本___読みます。',
    choices: ['は', 'が', 'を', 'に'],
    answerIndex: 2,
    explanation: 'を (wo) marks the direct object. 本を読みます means "I read a book".'
  },
  
  // Basic Verbs
  {
    id: 'jp-jlpt-n5-005',
    type: 'mcq',
    prompt: 'What is the polite form of 食べる?',
    choices: ['食べます', '食べました', '食べません', '食べて'],
    answerIndex: 0,
    explanation: '食べます (tabemasu) is the polite present form of 食べる (taberu) "to eat".'
  },
  
  // Time and Numbers
  {
    id: 'jp-jlpt-n5-006',
    type: 'typing',
    prompt: 'How do you say "7 o\'clock" in Japanese?',
    accept: ['しちじ', 'ななじ', '7時'],
    explanation: 'しちじ (shichiji) or ななじ (nanaji) means "7 o\'clock".'
  },
  
  // Family Terms
  {
    id: 'jp-jlpt-n5-007',
    type: 'mcq',
    prompt: 'How do you say "mother" (your own)?',
    choices: ['おかあさん', 'はは', 'おばあさん', 'おねえさん'],
    answerIndex: 1,
    explanation: 'はは (haha) is used when referring to your own mother to others.'
  },
  
  // Basic Adjectives
  {
    id: 'jp-jlpt-n5-008',
    type: 'mcq',
    prompt: 'Complete: この本は___です。(This book is interesting)',
    choices: ['おもしろい', 'おもしろく', 'おもしろかった', 'おもしろくない'],
    answerIndex: 0,
    explanation: 'おもしろい (omoshiroi) is the basic form of i-adjective meaning "interesting".'
  },
  
  // Location and Existence
  {
    id: 'jp-jlpt-n5-009',
    type: 'mcq',
    prompt: 'Complete: 机の上___本があります。(There is a book on the desk)',
    choices: ['は', 'が', 'を', 'に'],
    answerIndex: 3,
    explanation: 'に (ni) indicates location where something exists.'
  },
  
  // Daily Conversation
  {
    id: 'jp-jlpt-n5-010',
    type: 'open',
    prompt: 'Write a short self-introduction in Japanese including your name, nationality, and occupation.',
    explanation: 'Practice N5 level self-introduction using basic grammar patterns and vocabulary.'
  }
];

// N4 Level (Elementary-Intermediate)
export const japaneseJLPTN4: (MCQ | Typing | Open)[] = [
  // Te-form and Progressive
  {
    id: 'jp-jlpt-n4-001',
    type: 'mcq',
    prompt: 'What is the te-form of 読む?',
    choices: ['読んで', '読みて', '読いて', '読って'],
    answerIndex: 0,
    explanation: '読んで (yonde) is the te-form of 読む (yomu) "to read".'
  },
  {
    id: 'jp-jlpt-n4-002',
    type: 'mcq',
    prompt: 'Complete: 今、宿題___います。(I am doing homework now)',
    choices: ['をして', 'をしている', 'をした', 'をします'],
    answerIndex: 1,
    explanation: 'をしています indicates ongoing action "I am doing homework".'
  },
  
  // Potential Form
  {
    id: 'jp-jlpt-n4-003',
    type: 'mcq',
    prompt: 'How do you say "I can speak Japanese"?',
    choices: ['日本語を話します', '日本語が話せます', '日本語を話しました', '日本語を話してください'],
    answerIndex: 1,
    explanation: '話せます (hanasemasu) is the potential form meaning "can speak".'
  },
  
  // Comparison
  {
    id: 'jp-jlpt-n4-004',
    type: 'mcq',
    prompt: 'Complete: AはBより___です。(A is more expensive than B)',
    choices: ['安い', '高い', '大きい', '小さい'],
    answerIndex: 1,
    explanation: '高い (takai) means "expensive". より indicates comparison "more than".'
  },
  
  // Giving and Receiving
  {
    id: 'jp-jlpt-n4-005',
    type: 'mcq',
    prompt: 'Complete: 友達___プレゼントをもらいました。',
    choices: ['に', 'から', 'で', 'と'],
    answerIndex: 1,
    explanation: 'から (kara) indicates the source "I received a present from my friend".'
  },
  
  // Experience
  {
    id: 'jp-jlpt-n4-006',
    type: 'typing',
    prompt: 'How do you say "I have been to Tokyo" (experience)?',
    accept: ['東京に行ったことがあります', '東京へ行ったことがあります'],
    explanation: 'ことがあります expresses past experience "I have been to Tokyo".'
  },
  
  // Intention
  {
    id: 'jp-jlpt-n4-007',
    type: 'mcq',
    prompt: 'How do you express intention "I plan to go to Japan"?',
    choices: ['日本に行きます', '日本に行くつもりです', '日本に行きました', '日本に行ってください'],
    answerIndex: 1,
    explanation: 'つもりです expresses intention or plan "I plan to go".'
  },
  
  // Describing Changes
  {
    id: 'jp-jlpt-n4-008',
    type: 'open',
    prompt: 'Describe how your Japanese ability has changed since you started studying. Use appropriate grammar for expressing change.',
    explanation: 'Practice N4 grammar for expressing change and improvement using forms like ようになりました.'
  }
];

// N3 Level (Intermediate)
export const japaneseJLPTN3: (MCQ | Typing | Open)[] = [
  // Causative Form
  {
    id: 'jp-jlpt-n3-001',
    type: 'mcq',
    prompt: 'What is the causative form of 食べる?',
    choices: ['食べさせる', '食べられる', '食べさせられる', '食べさす'],
    answerIndex: 0,
    explanation: '食べさせる (tabesaseru) is the causative form meaning "to make/let someone eat".'
  },
  
  // Passive Form
  {
    id: 'jp-jlpt-n3-002',
    type: 'mcq',
    prompt: 'Complete the passive sentence: この本は多くの人___読まれています。',
    choices: ['が', 'を', 'に', 'によって'],
    answerIndex: 3,
    explanation: 'によって indicates the agent in passive sentences "This book is read by many people".'
  },
  
  // Conditional Forms
  {
    id: 'jp-jlpt-n3-003',
    type: 'mcq',
    prompt: 'Which expresses "If I were rich, I would travel"?',
    choices: ['お金持ちだったら、旅行します', 'お金持ちなら、旅行します', 'お金持ちだったら、旅行するでしょう', 'All are possible'],
    answerIndex: 3,
    explanation: 'All forms can express hypothetical conditions with slight nuance differences.'
  },
  
  // Advanced Expressions
  {
    id: 'jp-jlpt-n3-004',
    type: 'mcq',
    prompt: 'Complete: 雨が降りそう___、傘を持って行きます。',
    choices: ['だから', 'なので', 'ので', 'All are correct'],
    answerIndex: 3,
    explanation: 'All three expressions can indicate reason "Because it looks like rain, I\'ll take an umbrella".'
  },
  
  // Expressing Appearance
  {
    id: 'jp-jlpt-n3-005',
    type: 'typing',
    prompt: 'How do you say "It seems like he is busy"?',
    accept: ['忙しそうです', '忙しいようです', '忙しいみたいです'],
    explanation: 'そうです, ようです, and みたいです all express appearance or hearsay.'
  },
  
  // Complex Grammar
  {
    id: 'jp-jlpt-n3-006',
    type: 'mcq',
    prompt: 'Complete: 宿題をする___、友達と遊びに行きました。',
    choices: ['前に', '後で', 'かわりに', 'ために'],
    answerIndex: 2,
    explanation: 'かわりに means "instead of" - "Instead of doing homework, I went to play with friends".'
  },
  
  // Expressing Regret
  {
    id: 'jp-jlpt-n3-007',
    type: 'open',
    prompt: 'Write about something you regret not doing in the past. Use appropriate N3 grammar patterns.',
    explanation: 'Practice expressing regret using patterns like ～ばよかった or ～べきでした.'
  }
];

// N2 Level (Upper-Intermediate)
export const japaneseJLPTN2: (MCQ | Typing | Open)[] = [
  // Advanced Grammar Patterns
  {
    id: 'jp-jlpt-n2-001',
    type: 'mcq',
    prompt: 'Complete: 彼は忙しい___、手伝ってくれました。',
    choices: ['にもかかわらず', 'にしても', 'にしては', 'について'],
    answerIndex: 0,
    explanation: 'にもかかわらず means "despite/in spite of" - "Despite being busy, he helped me".'
  },
  
  // Formal Expressions
  {
    id: 'jp-jlpt-n2-002',
    type: 'mcq',
    prompt: 'Which is the most formal way to say "regarding this matter"?',
    choices: ['この件について', 'この件に関して', 'この件につきまして', 'この件のことで'],
    answerIndex: 2,
    explanation: 'につきまして is the most formal expression for "regarding/concerning".'
  },
  
  // Abstract Concepts
  {
    id: 'jp-jlpt-n2-003',
    type: 'typing',
    prompt: 'What word means "to take into consideration"?',
    accept: ['考慮する', 'こうりょする'],
    explanation: '考慮する (kouryo suru) means "to take into consideration".'
  },
  
  // Complex Conditionals
  {
    id: 'jp-jlpt-n2-004',
    type: 'mcq',
    prompt: 'Complete: もう少し早く出発していれば、間に合った___。',
    choices: ['でしょう', 'はずです', 'のに', 'かもしれません'],
    answerIndex: 2,
    explanation: 'のに expresses regret "If I had left earlier, I would have made it".'
  },
  
  // Business/Academic Language
  {
    id: 'jp-jlpt-n2-005',
    type: 'open',
    prompt: 'Write a formal email declining a meeting invitation. Use appropriate keigo and business expressions.',
    explanation: 'Practice N2 level formal writing with proper keigo and business etiquette.'
  },
  
  // Cultural Expressions
  {
    id: 'jp-jlpt-n2-006',
    type: 'mcq',
    prompt: 'What does the expression "空気を読む" mean?',
    choices: ['To read books', 'To understand the atmosphere/situation', 'To breathe fresh air', 'To study hard'],
    answerIndex: 1,
    explanation: '空気を読む (kuuki wo yomu) means "to read the atmosphere" or understand unspoken social cues.'
  }
];

// N1 Level (Advanced)
export const japaneseJLPTN1: (MCQ | Typing | Open)[] = [
  // Highly Formal/Literary Language
  {
    id: 'jp-jlpt-n1-001',
    type: 'mcq',
    prompt: 'Complete the formal expression: ご質問___、お答えいたします。',
    choices: ['については', 'に関しましては', 'につきましては', 'All are correct'],
    answerIndex: 3,
    explanation: 'All three are highly formal ways to say "regarding your question".'
  },
  
  // Classical/Literary Grammar
  {
    id: 'jp-jlpt-n1-002',
    type: 'mcq',
    prompt: 'What does ～んばかりに express?',
    choices: ['Almost to the point of', 'Only if', 'As soon as', 'In order to'],
    answerIndex: 0,
    explanation: '～んばかりに expresses "almost to the point of" or "as if about to".'
  },
  
  // Advanced Vocabulary
  {
    id: 'jp-jlpt-n1-003',
    type: 'typing',
    prompt: 'What is the formal word for "to implement/execute"?',
    accept: ['実施する', 'じっしする', '遂行する', 'すいこうする'],
    explanation: '実施する (jisshi suru) or 遂行する (suikou suru) mean "to implement/execute".'
  },
  
  // Nuanced Expressions
  {
    id: 'jp-jlpt-n1-004',
    type: 'mcq',
    prompt: 'Choose the most appropriate: 彼の提案は___ものがある。',
    choices: ['興味深い', '興味深いところの', '興味をそそる', '興味深いものの'],
    answerIndex: 1,
    explanation: '興味深いところのある means "has interesting aspects" - more nuanced than simple "interesting".'
  },
  
  // Academic/Professional Writing
  {
    id: 'jp-jlpt-n1-005',
    type: 'open',
    prompt: 'Write an analysis of the impact of demographic changes on Japanese society. Use N1 level vocabulary and grammar.',
    explanation: 'Demonstrate mastery of academic Japanese with complex analysis and sophisticated language.'
  },
  
  // Cultural and Historical Knowledge
  {
    id: 'jp-jlpt-n1-006',
    type: 'open',
    prompt: 'Discuss the evolution of Japanese language policy in the post-war period and its social implications.',
    explanation: 'Show deep understanding of Japanese society, history, and language policy using advanced Japanese.'
  }
];