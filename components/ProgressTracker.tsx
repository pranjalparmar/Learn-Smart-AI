
import React, { useMemo, useState } from 'react';
import { Flashcard, QA } from '../types';
import { Download, FileText, Lightbulb, TrendingUp, TrendingDown, CheckCircle, XCircle, SkipForwardIcon, HelpCircle } from 'lucide-react';
import IconButton from './IconButton';
import { exportToPDF, exportProgressToCSV } from '../services/exportService';

type StudyItem = (Flashcard | QA) & { type: string };

interface ProgressTrackerProps {
    flashcards: Flashcard[];
    knowledgeQA: QA[];
    scenarioQA: QA[];
}

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
    >
        {label}
    </button>
);

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ flashcards, knowledgeQA, scenarioQA }) => {
    const [activeTab, setActiveTab] = useState<'strong' | 'weak'>('weak');

    const allItems = useMemo<StudyItem[]>(() => [
        ...flashcards.map(item => ({ ...item, type: 'Flashcard' })),
        ...knowledgeQA.map(item => ({ ...item, type: 'Knowledge Q&A' })),
        ...scenarioQA.map(item => ({ ...item, type: 'Scenario Q&A' })),
    ], [flashcards, knowledgeQA, scenarioQA]);

    const stats = useMemo(() => {
        const total = allItems.length;
        const correct = allItems.filter(i => i.studyStatus === 'correct').length;
        const wrong = allItems.filter(i => i.studyStatus === 'wrong').length;
        const skipped = allItems.filter(i => i.studyStatus === 'skipped').length;
        const unseen = total - correct - wrong - skipped;
        return { total, correct, wrong, skipped, unseen };
    }, [allItems]);

    const strongTopics = useMemo(() => allItems.filter(i => i.studyStatus === 'correct'), [allItems]);
    const weakTopics = useMemo(() => allItems.filter(i => i.studyStatus === 'wrong' || i.studyStatus === 'skipped'), [allItems]);

    const feedbackMessage = useMemo(() => {
        if (stats.total === 0) return "Upload some notes to get started!";
        if (stats.unseen === stats.total) return "You're ready to start! Tackle your first card to begin tracking your progress.";
        if (stats.correct === stats.total) return "Outstanding! You've mastered all the material. Great work!";
        if (stats.correct > stats.wrong + stats.skipped) return "You're making excellent progress! Keep focusing on the remaining topics to master them all.";
        return "Great start! Reviewing the 'Weak Topics' list is a great next step to strengthen your understanding.";
    }, [stats]);

    if (allItems.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Nothing to track yet.</h2>
                <p className="text-slate-500 dark:text-slate-400">Once you generate study materials, your progress will appear here.</p>
            </div>
        )
    }

    return (
        <div id="progress-section">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Progress Tracker</h2>
                <div className="flex items-center space-x-2">
                    <IconButton icon={<FileText className="w-4 h-4" />} tooltip="Export as CSV" onClick={() => exportProgressToCSV(strongTopics, weakTopics)} />
                    <IconButton icon={<Download className="w-4 h-4" />} tooltip="Export as PDF" onClick={() => exportToPDF('progress-section', 'IntelliStudy-Progress')} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<CheckCircle className="text-green-800" />} label="Correct" value={stats.correct} color="bg-green-100 dark:bg-green-900/50" />
                <StatCard icon={<XCircle className="text-red-800" />} label="Wrong" value={stats.wrong} color="bg-red-100 dark:bg-red-900/50" />
                <StatCard icon={<SkipForwardIcon className="text-yellow-800" />} label="Skipped" value={stats.skipped} color="bg-yellow-100 dark:bg-yellow-900/50" />
                <StatCard icon={<HelpCircle className="text-gray-800" />} label="Unseen" value={stats.unseen} color="bg-gray-100 dark:bg-gray-700" />
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-6 flex overflow-hidden">
                <div className="bg-green-500 h-4" style={{ width: `${(stats.correct / stats.total) * 100}%` }}></div>
                <div className="bg-red-500 h-4" style={{ width: `${(stats.wrong / stats.total) * 100}%` }}></div>
                <div className="bg-yellow-500 h-4" style={{ width: `${(stats.skipped / stats.total) * 100}%` }}></div>
            </div>

            {/* Feedback Box */}
            <div className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 rounded-r-lg mb-8 flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 mt-1 flex-shrink-0" />
                <p className="text-sm font-medium">{feedbackMessage}</p>
            </div>

            {/* Topics Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Topic Review</h3>
                    <div className="flex space-x-2">
                        <TabButton label={`Weak Topics (${weakTopics.length})`} isActive={activeTab === 'weak'} onClick={() => setActiveTab('weak')} />
                        <TabButton label={`Strong Topics (${strongTopics.length})`} isActive={activeTab === 'strong'} onClick={() => setActiveTab('strong')} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md min-h-[200px]">
                    {activeTab === 'weak' && (
                        <ul className="space-y-3">
                            {weakTopics.length > 0 ? weakTopics.map(item => (
                                <li key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm">
                                    <span className={`font-semibold mr-2 ${item.studyStatus === 'wrong' ? 'text-red-500' : 'text-yellow-500'}`}>[{item.studyStatus.toUpperCase()}]</span>
                                    <span className="font-medium text-slate-500 dark:text-slate-400">({item.type})</span>
                                    <span className="ml-2 text-slate-700 dark:text-slate-300">{item.question}</span>
                                </li>
                            )) : <p className="text-center text-slate-500 pt-8">No weak topics to show yet. Keep studying!</p>}
                        </ul>
                    )}
                    {activeTab === 'strong' && (
                         <ul className="space-y-3">
                            {strongTopics.length > 0 ? strongTopics.map(item => (
                                <li key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm">
                                    <span className="font-semibold mr-2 text-green-500">[CORRECT]</span>
                                    <span className="font-medium text-slate-500 dark:text-slate-400">({item.type})</span>
                                    <span className="ml-2 text-slate-700 dark:text-slate-300">{item.question}</span>
                                </li>
                            )) : <p className="text-center text-slate-500 pt-8">No strong topics to show yet. Mark some items as correct!</p>}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
