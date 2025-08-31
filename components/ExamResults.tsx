import React from 'react';
import { ExamResult } from '../types';
import { Clock, CheckCircle2, XCircle, Tag, CheckSquare, BarChart } from 'lucide-react';

interface ExamResultsProps {
    result: ExamResult;
    onClose: () => void;
}

const StatCard = ({ label, value, icon, iconColor }: { label: string, value: string | number, icon: React.ReactNode, iconColor?: string }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
        <div className={`text-xl ${iconColor || 'text-slate-500 dark:text-slate-400'}`}>{icon}</div>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{label}</p>
    </div>
);

const ExamResults: React.FC<ExamResultsProps> = ({ result, onClose }) => {
    const scorePercentage = result.totalQuestions > 0 ? Math.round((result.score / result.totalQuestions) * 100) : 0;
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <CheckSquare className="w-8 h-8 text-green-500 mr-3" />
                <h2 className="text-2xl sm:text-3xl font-bold">Exam Results</h2>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="text-center md:text-left">
                        <p className="text-lg text-slate-600 dark:text-slate-300">Final Score</p>
                        <p className={`text-6xl font-extrabold my-1 ${scorePercentage >= 70 ? 'text-green-500' : scorePercentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {scorePercentage}%
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        <StatCard label="Score" value={`${result.score}/${result.totalQuestions}`} icon={<BarChart />} />
                        <StatCard label="Correct" value={result.score} icon={<CheckCircle2 />} iconColor="text-green-500" />
                        <StatCard label="Incorrect" value={result.totalQuestions - result.score} icon={<XCircle />} iconColor="text-red-500" />
                        <StatCard label="Time" value={formatTime(result.timeTaken)} icon={<Clock />} />
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-center text-slate-600 dark:text-slate-300">Topics Covered</h4>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {result.topics.map(topic => (
                            <span key={topic} className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                <Tag className="w-3 h-3 mr-1"/>{topic}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">Question Review</h3>
                <div className="space-y-4">
                    {result.answers.map((answer, index) => (
                        <div key={answer.itemId} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                            <div className="flex items-start justify-between">
                                <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex-grow pr-4">
                                    Q{index + 1}: {answer.question}
                                </p>
                                {answer.userAnswer === 'correct' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md mt-2">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Correct Answer:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{answer.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onClose}
                    className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Exam Setup
                </button>
            </div>
        </div>
    );
};

export default ExamResults;
