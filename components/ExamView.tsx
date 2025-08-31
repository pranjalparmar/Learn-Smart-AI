import React, { useState, useEffect } from 'react';
import { Flashcard, QA, StudyStatus } from '../types';
import { Clock, CheckSquare, X, Check } from 'lucide-react';

type StudyItem = Flashcard | QA;

interface ExamViewProps {
    items: StudyItem[];
    onFinishExam: (answers: Map<string, StudyStatus>, time: number) => void;
}

const ExamView: React.FC<ExamViewProps> = ({ items, onFinishExam }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [answers, setAnswers] = useState<Map<string, StudyStatus>>(new Map());
    const [time, setTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(prevTime => prevTime + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const currentItem = items[currentIndex];

    const handleAnswer = (status: 'correct' | 'wrong') => {
        const newAnswers = new Map(answers).set(currentItem.id, status);
        setAnswers(newAnswers);
        
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsAnswerVisible(false);
        } else {
            onFinishExam(newAnswers, time);
        }
    };

    const handleFinishEarly = () => {
        onFinishExam(answers, time);
    };

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center border-b dark:border-slate-700 pb-4 mb-6 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Exam in Progress</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentIndex + 1} of {items.length}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-lg font-semibold bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-100">
                            <Clock className="w-5 h-5" />
                            <span>{formatTime(time)}</span>
                        </div>
                        <button onClick={handleFinishEarly} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Finish Exam Early">
                            <X className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                        </button>
                    </div>
                </div>

                {/* Question & Answer Area */}
                <div className="flex-grow flex flex-col justify-center mb-6 overflow-y-auto">
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{currentItem.question}</p>
                    {isAnswerVisible && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-fade-in-up">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{currentItem.answer}</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="mt-auto pt-6 border-t dark:border-slate-700 flex-shrink-0">
                    {isAnswerVisible ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Did you get it right?</p>
                            <div className="flex gap-4">
                                <button onClick={() => handleAnswer('correct')} className="flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-transform hover:scale-105">
                                    <Check className="w-5 h-5"/> Yes
                                </button>
                                <button onClick={() => handleAnswer('wrong')} className="flex items-center gap-2 bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-transform hover:scale-105">
                                    <X className="w-5 h-5"/> No
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center">
                            <button onClick={() => setIsAnswerVisible(true)} className="w-full sm:w-auto font-semibold bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                                Reveal Answer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamView;
