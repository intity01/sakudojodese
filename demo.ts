// Demo: การใช้งาน Saku Dojo v2 Engine
// Demo usage of Saku Dojo v2 Engine

import { DojoEngine, SessionState } from './src/engine/DojoEngine';
import type { QuestionBank, MCQ, Typing, Open } from './src/types/core';

// สร้างข้อมูลคำถามตัวอย่าง / Create sample question bank
const sampleQuestionBank: QuestionBank = {
    EN: {
        Classic: {
            Beginner: [
                {
                    id: 'en-mcq-1',
                    type: 'mcq',
                    prompt: 'What is the capital of Thailand?',
                    choices: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
                    answerIndex: 0,
                    explanation: 'Bangkok is the capital and largest city of Thailand.'
                } as MCQ,
                {
                    id: 'en-typing-1',
                    type: 'typing',
                    prompt: 'Type the word "hello" in English',
                    accept: ['hello', 'Hello', 'HELLO'],
                    placeholder: 'Type your answer here...',
                    explanation: 'Hello is a common greeting in English.'
                } as Typing,
                {
                    id: 'en-open-1',
                    type: 'open',
                    prompt: 'Describe your favorite hobby in 2-3 sentences.',
                    explanation: 'This is an open-ended question to practice writing skills.',
                    rubric: ['Grammar', 'Vocabulary', 'Coherence']
                } as Open,
                {
                    id: 'en-mcq-2',
                    type: 'mcq',
                    prompt: 'Which of these is a fruit?',
                    choices: ['Carrot', 'Apple', 'Potato', 'Onion'],
                    answerIndex: 1,
                    explanation: 'An apple is a fruit, while the others are vegetables.'
                } as MCQ,
                {
                    id: 'en-typing-2',
                    type: 'typing',
                    prompt: 'Complete: "I ___ to school every day" (go/goes)',
                    accept: ['go', 'Go'],
                    explanation: 'Use "go" with "I" (first person singular).'
                } as Typing
            ]
        },
        CEFR: {
            A1: [
                {
                    id: 'cefr-a1-1',
                    type: 'mcq',
                    prompt: 'How do you say "good morning"?',
                    choices: ['Good night', 'Good morning', 'Good evening', 'Good afternoon'],
                    answerIndex: 1,
                    explanation: 'Good morning is used to greet someone in the morning.'
                } as MCQ
            ]
        },
        JLPT: {
            N5: []
        }
    },
    JP: {
        Classic: {
            Beginner: [
                {
                    id: 'jp-mcq-1',
                    type: 'mcq',
                    prompt: 'こんにちは means:',
                    choices: ['Good morning', 'Hello/Good afternoon', 'Good evening', 'Good night'],
                    answerIndex: 1,
                    explanation: 'こんにちは (konnichiwa) is used as a greeting during the day.'
                } as MCQ
            ]
        },
        CEFR: {
            A1: []
        },
        JLPT: {
            N5: [
                {
                    id: 'jlpt-n5-1',
                    type: 'typing',
                    prompt: 'Type "arigatou" in hiragana',
                    accept: ['ありがとう', 'あリがとう'],
                    explanation: 'ありがとう means "thank you" in Japanese.'
                } as Typing
            ]
        }
    }
};

// ฟังก์ชันสำหรับแสดงผลคำถาม / Function to display question
function displayQuestion(engine: DojoEngine): void {
    const question = engine.getCurrentQuestion();
    const progress = engine.getSessionProgress();

    console.log('\n' + '='.repeat(50));
    console.log(`📚 Question ${progress.current}/${progress.total} | Score: ${progress.correct}/${progress.current - 1}`);
    console.log('='.repeat(50));

    if (!question) {
        console.log('❌ No question available');
        return;
    }

    console.log(`🎯 ${question.prompt}`);

    if (question.type === 'mcq') {
        const mcq = question as MCQ;
        mcq.choices.forEach((choice, index) => {
            console.log(`   ${index + 1}. ${choice}`);
        });
    } else if (question.type === 'typing') {
        const typing = question as Typing;
        if (typing.placeholder) {
            console.log(`💡 Hint: ${typing.placeholder}`);
        }
    } else if (question.type === 'open') {
        const open = question as Open;
        if (open.rubric) {
            console.log(`📋 Evaluation criteria: ${open.rubric.join(', ')}`);
        }
    }
}

// ฟังก์ชันสำหรับแสดงผลคำตอบ / Function to display answer result
function displayResult(result: any): void {
    console.log('\n' + '-'.repeat(30));
    if (result.isCorrect) {
        console.log('✅ Correct!');
    } else {
        console.log('❌ Incorrect');
    }

    if (result.explanation) {
        console.log(`💡 ${result.explanation}`);
    }

    if (result.correctAnswer) {
        if (Array.isArray(result.correctAnswer)) {
            console.log(`🎯 Acceptable answers: ${result.correctAnswer.join(', ')}`);
        } else {
            console.log(`🎯 Correct answer: ${result.correctAnswer}`);
        }
    }
    console.log('-'.repeat(30));
}

// ฟังก์ชันหลักสำหรับ Demo / Main demo function
async function runDemo(): Promise<void> {
    console.log('🎌 Welcome to Saku Dojo v2 Demo! 🎌');
    console.log('Language Learning Engine Demonstration\n');

    // สร้าง DojoEngine instance
    const engine = new DojoEngine(sampleQuestionBank);

    // Demo 1: English Classic Beginner Quiz
    console.log('📖 Demo 1: English Classic Beginner Quiz');
    console.log('Starting a 3-question quiz session...\n');

    const success = engine.startSession({
        track: 'EN',
        framework: 'Classic',
        level: 'Beginner',
        mode: 'Quiz',
        questionCount: 3,
        shuffleQuestions: false // ไม่สลับเพื่อให้ demo เป็นระเบียบ
    });

    if (!success) {
        console.log('❌ Failed to start session');
        return;
    }

    // ตอบคำถามทั้งหมด / Answer all questions
    let questionCount = 0;
    while (engine.getSessionState() === SessionState.ACTIVE && questionCount < 5) {
        questionCount++;
        displayQuestion(engine);

        const question = engine.getCurrentQuestion();
        if (!question) break;

        // จำลองการตอบคำถาม / Simulate answering questions
        let result;
        if (question.type === 'mcq') {
            // ตอบข้อแรกถูก ข้อที่สองผิด
            const answer = questionCount === 1 ? 0 : (questionCount === 4 ? 1 : 2);
            result = engine.answerMCQ(answer);
            console.log(`\n👤 User selected: ${answer + 1}`);
        } else if (question.type === 'typing') {
            const answers = ['hello', 'go'];
            const answer = answers[questionCount === 2 ? 0 : 1] || 'test';
            result = engine.answerTyping(answer);
            console.log(`\n👤 User typed: "${answer}"`);
        } else if (question.type === 'open') {
            const answer = 'I love reading books because it helps me learn new things and relax.';
            result = engine.answerOpen(answer);
            console.log(`\n👤 User wrote: "${answer}"`);
        }

        if (result) {
            displayResult(result);
        }

        // ไปข้อถัดไป / Move to next question
        const hasNext = engine.nextQuestion();
        if (!hasNext) {
            console.log('\n🏁 Session completed!');
            break;
        }

        // หยุดพักเล็กน้อย / Small pause for readability
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // แสดงผลสุดท้าย / Show final results
    const progressEntry = engine.finishSession();
    if (progressEntry) {
        console.log('\n' + '🎉'.repeat(20));
        console.log('📊 FINAL RESULTS');
        console.log('🎉'.repeat(20));
        console.log(`📅 Date: ${progressEntry.date}`);
        console.log(`🌍 Language: ${progressEntry.track}`);
        console.log(`📚 Framework: ${progressEntry.framework}`);
        console.log(`📈 Level: ${progressEntry.level}`);
        console.log(`🎮 Mode: ${progressEntry.mode}`);
        console.log(`✅ Score: ${progressEntry.correct}/${progressEntry.total} (${progressEntry.scorePct}%)`);

        // ประเมินผล / Evaluate performance
        if (progressEntry.scorePct >= 80) {
            console.log('🌟 Excellent! You\'re ready for the next level!');
        } else if (progressEntry.scorePct >= 60) {
            console.log('👍 Good job! Keep practicing!');
        } else {
            console.log('💪 Keep studying! You\'ll improve with practice!');
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎌 Demo completed! Thank you for trying Saku Dojo v2! 🎌');
    console.log('='.repeat(50));
}

// เรียกใช้ Demo / Run the demo
runDemo().catch(console.error);

export { runDemo, sampleQuestionBank };