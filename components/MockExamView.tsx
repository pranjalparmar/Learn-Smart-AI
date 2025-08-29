import React, { useState, useEffect } from 'react';
import { Flashcard, QA } from '../types';
import { Clock, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';

type StudyItem = Flashcard | QA;

interface MockExamViewProps {
    items: StudyItem[];
    onFinish: () => void;
}

const MockExamView: React.FC<MockExamViewProps> = ({ items, onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
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

    const goToNext = () => {
        setIsAnswerVisible(false);
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrev = () => {
        setIsAnswerVisible(false);
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8">
                <div className="flex justify-between items-center border-b dark:border-slate-700 pb-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Mock Exam</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentIndex + 1} of {items.length}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-lg font-semibold bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                        <Clock className="w-5 h-5" />
                        <span>{formatTime(time)}</span>
                    </div>
                </div>

                <div className="min-h-[200px] flex flex-col justify-center mb-6">
                    <p className="text-lg font-semibold mb-4">{currentItem.question}</p>
                    {isAnswerVisible && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-fade-in-up">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{currentItem.answer}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-slate-700">
                    <button onClick={() => setIsAnswerVisible(!isAnswerVisible)} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    <div className="flex items-center space-x-2">
                        <button onClick={goToPrev} disabled={currentIndex === 0} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToNext} disabled={currentIndex === items.length - 1} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={onFinish}
                          className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                            <CheckSquare className="w-5 h-5 mr-2" />
                            Finish Exam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockExamView;