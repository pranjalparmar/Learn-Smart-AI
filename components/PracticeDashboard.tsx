import React from 'react';
import { Flashcard, QA, PracticeSet } from '../types';
import { Target, PlusCircle, Play, Trash2 } from 'lucide-react';
import IconButton from './IconButton';

type StudyItem = Flashcard | QA;

interface PracticeDashboardProps {
    allItems: StudyItem[];
    practiceSets: PracticeSet[];
    onUpdatePracticeSets: (sets: PracticeSet[]) => void;
    onStartMockExam: (items: StudyItem[]) => void;
}

const PracticeDashboard: React.FC<PracticeDashboardProps> = ({ allItems, practiceSets, onUpdatePracticeSets, onStartMockExam }) => {

    const generateMockExam = () => {
        const weakItems = allItems.filter(i => i.studyStatus === 'wrong' || i.studyStatus === 'skipped' || i.studyStatus === 'unseen' || i.isFlagged);
        const shuffled = weakItems.sort(() => 0.5 - Math.random());
        const examItems = shuffled.slice(0, 20); 
        if(examItems.length > 0) {
            onStartMockExam(examItems);
        } else {
            alert("Congratulations, you have no weak topics to test! Review your materials or start a new session.");
        }
    };
    
    const startPracticeSet = (set: PracticeSet) => {
        const items = allItems.filter(item => set.itemIds.includes(item.id));
        if (items.length > 0) {
            onStartMockExam(items);
        }
    }
    
    const deletePracticeSet = (setId: string) => {
        const updatedSets = practiceSets.filter(s => s.id !== setId);
        onUpdatePracticeSets(updatedSets);
    }

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Practice & Exams</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mock Exam Generator */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col">
                    <div className="flex items-center mb-4">
                        <Target className="w-6 h-6 text-blue-500 mr-3" />
                        <h3 className="text-xl font-bold">Auto-Generate Mock Exam</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm flex-grow">
                        Challenge yourself with a focused exam on your weakest areas. The AI will select up to 20 questions you've struggled with, flagged, or haven't seen yet.
                    </p>
                    <button 
                        onClick={generateMockExam}
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start Mock Exam
                    </button>
                </div>

                {/* Custom Practice Sets */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Custom Practice Sets</h3>
                        <button 
                          className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors opacity-50 cursor-not-allowed"
                          disabled
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Create New Set
                        </button>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {practiceSets.length > 0 ? practiceSets.map(set => (
                            <div key={set.id} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold">{set.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{set.itemIds.length} items</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <IconButton icon={<Play className="w-4 h-4"/>} tooltip="Start" onClick={() => startPracticeSet(set)} />
                                    <IconButton icon={<Trash2 className="w-4 h-4"/>} tooltip="Delete" onClick={() => deletePracticeSet(set.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
                                <p className="font-semibold">Custom Set Builder Coming Soon!</p>
                                <p className="mt-1">This feature will allow you to create, save, and launch your own targeted practice sets.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeDashboard;