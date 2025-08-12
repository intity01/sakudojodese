import { useState } from 'react';
import type { Track, Framework, Mode } from '../types/core';

interface StartScreenProps {
    onStartSession: (config: {
        track: Track;
        framework: Framework;
        level: string;
        mode: Mode;
        questionCount?: number;
    }) => void;
    onShowProgress: () => void;
    progressCount: number;
}

const StartScreen: React.FC<StartScreenProps> = ({
    onStartSession,
    onShowProgress,
    progressCount
}) => {
    const [track, setTrack] = useState<Track>('EN');
    const [framework, setFramework] = useState<Framework>('Classic');
    const [level, setLevel] = useState('Beginner');
    const [mode, setMode] = useState<Mode>('Quiz');
    const [questionCount, setQuestionCount] = useState(5);

    const handleStart = () => {
        const config: {
            track: Track;
            framework: Framework;
            level: string;
            mode: Mode;
            questionCount?: number;
        } = {
            track,
            framework,
            level,
            mode
        };

        if (mode === 'Quiz') {
            config.questionCount = questionCount;
        }

        onStartSession(config);
    };

    const getLevels = () => {
        if (framework === 'CEFR') {
            return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        } else if (framework === 'JLPT') {
            return ['N5', 'N4', 'N3', 'N2', 'N1'];
        } else {
            return ['Beginner', 'Intermediate', 'Advanced'];
        }
    };

    return (
        <div className="fade-in">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="card-header">
                    <h2 className="text-2xl font-bold text-center mb-2">
                        🎯 Start Learning Session
                    </h2>
                    <p className="text-gray-600 text-center">
                        Choose your language, framework, and difficulty level
                    </p>
                </div>

                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">
                            🌍 Language / ภาษา
                        </label>
                        <select
                            className="form-select"
                            value={track}
                            onChange={(e) => setTrack(e.target.value as Track)}
                        >
                            <option value="EN">🇺🇸 English (อังกฤษ)</option>
                            <option value="JP">🇯🇵 Japanese (ญี่ปุ่น)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            📚 Framework / หลักสูตร
                        </label>
                        <select
                            className="form-select"
                            value={framework}
                            onChange={(e) => {
                                const newFramework = e.target.value as Framework;
                                setFramework(newFramework);
                                // Reset level when framework changes
                                if (newFramework === 'CEFR') {
                                    setLevel('A1');
                                } else if (newFramework === 'JLPT') {
                                    setLevel('N5');
                                } else {
                                    setLevel('Beginner');
                                }
                            }}
                        >
                            <option value="Classic">🎓 Classic (ทั่วไป)</option>
                            <option value="CEFR">🇪🇺 CEFR (มาตรฐานยุโรป)</option>
                            <option value="JLPT">🎌 JLPT (มาตรฐานญี่ปุ่น)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            📈 Level / ระดับ
                        </label>
                        <select
                            className="form-select"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            {getLevels().map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            🎮 Mode / โหมด
                        </label>
                        <select
                            className="form-select"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as Mode)}
                        >
                            <option value="Quiz">⚡ Quiz (แบบทดสอบสั้น)</option>
                            <option value="Study">📖 Study (ศึกษา)</option>
                            <option value="Exam">📝 Exam (สอบ)</option>
                            <option value="Read">👁️ Read (อ่าน)</option>
                            <option value="Write">✍️ Write (เขียน)</option>
                        </select>
                    </div>

                    {mode === 'Quiz' && (
                        <div className="form-group">
                            <label className="form-label">
                                🔢 Number of Questions / จำนวนข้อ
                            </label>
                            <select
                                className="form-select"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                            >
                                <option value={3}>3 questions</option>
                                <option value={5}>5 questions</option>
                                <option value={10}>10 questions</option>
                                <option value={15}>15 questions</option>
                                <option value={20}>20 questions</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <div className="flex flex-col gap-4">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleStart}
                        >
                            🚀 Start Learning
                        </button>

                        {progressCount > 0 && (
                            <button
                                className="btn btn-secondary"
                                onClick={onShowProgress}
                            >
                                📊 View Progress ({progressCount} sessions)
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Info */}
            <div className="mt-8">
                <div className="card">
                    <div className="card-body">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            ℹ️ How to Use / วิธีใช้งาน
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>📱 Mobile Friendly:</strong> Works perfectly on phones and tablets</p>
                            <p><strong>💾 Auto Save:</strong> Your progress is automatically saved</p>
                            <p><strong>🔄 Offline Ready:</strong> Works without internet after first load</p>
                            <p><strong>🎯 Question Types:</strong> Multiple choice, typing, and open-ended</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;