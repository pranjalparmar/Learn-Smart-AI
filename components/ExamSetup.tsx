import React, { useState, useMemo } from 'react';
import { StudyTopicNode, Flashcard, QA } from '../types';
import { CheckSquare, Play } from 'lucide-react';

type StudyItem = Flashcard | QA;

interface ExamSetupProps {
    topics: StudyTopicNode[];
    onStartExam: (topicIds: string[], numQuestions: number, topicLabels: string[]) => void;
}

const ExamSetup: React.FC<ExamSetupProps> = ({ topics, onStartExam }) => {
    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
    const [numQuestions, setNumQuestions] = useState(10);

    const availableQuestions = useMemo(() => {
        if (selectedTopicIds.length === 0 || !topics) return [];
        let items: StudyItem[] = [];
        const getItemsRecursively = (nodes: StudyTopicNode[]) => {
            for (const node of nodes) {
                items.push(...node.flashcards, ...node.knowledgeQA, ...node.scenarioQA);
                if (node.children) {
                    getItemsRecursively(node.children);
                }
            }
        };
        const selectedTopics = topics.filter(topic => selectedTopicIds.includes(topic.id));
        getItemsRecursively(selectedTopics);
        return items;
    }, [selectedTopicIds, topics]);
    
    const maxQuestions = availableQuestions.length;

    const handleTopicToggle = (topicId: string) => {
        setSelectedTopicIds(prev =>
            prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };

    const handleStart = () => {
        const finalNumQuestions = Math.min(numQuestions, maxQuestions);
        if (finalNumQuestions > 0) {
            const selectedTopicLabels = topics
                .filter(t => selectedTopicIds.includes(t.id))
                .map(t => t.label);
            onStartExam(selectedTopicIds, finalNumQuestions, selectedTopicLabels);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <CheckSquare className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl sm:text-3xl font-bold">Setup Your Exam</h2>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Topic Selection */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">1. Select Topics</h3>
                        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md max-h-60 overflow-y-auto">
                            {topics.length > 0 ? topics.map(topic => (
                                <label key={topic.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedTopicIds.includes(topic.id)}
                                        onChange={() => handleTopicToggle(topic.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">{topic.label}</span>
                                </label>
                            )) : (
                                <p className="text-sm text-center text-slate-500 p-4">No topics available. Upload a file to get started.</p>
                            )}
                        </div>
                    </div>

                    {/* Number of Questions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">2. Number of Questions</h3>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Questions:</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-lg font-bold rounded-md">
                                    {Math.min(numQuestions, maxQuestions)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max={maxQuestions > 5 ? maxQuestions : 5}
                                value={numQuestions}
                                onChange={e => setNumQuestions(Number(e.target.value))}
                                disabled={maxQuestions === 0}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                                {maxQuestions} questions available in selected topics.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                    <button
                        onClick={handleStart}
                        disabled={selectedTopicIds.length === 0 || maxQuestions === 0}
                        className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto sm:mx-auto"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start Exam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamSetup;
