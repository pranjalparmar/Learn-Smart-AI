import React, { useState, useMemo } from 'react';
import { QA as QAType, StudyStatus } from '../types';
import { exportQAToCSV, exportQAToPDF } from '../services/exportService';
import { Download, FileText, Trash2, ChevronDown, CheckCircle2, XCircle, SkipForward, Shuffle, ListOrdered, Flag } from 'lucide-react';
import IconButton from './IconButton';

interface EditableFieldProps {
    value: string;
    onSave: (newValue: string) => void;
    isQuestion?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, onSave, isQuestion = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };

    const baseClasses = "w-full cursor-pointer whitespace-pre-wrap";
    const textClasses = isQuestion ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-300";
    
    if (isEditing) {
        return (
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave}
                autoFocus
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
        );
    }

    return (
        <div className={`${baseClasses} ${textClasses}`} onClick={() => setIsEditing(true)}>
            {value}
        </div>
    );
};


interface QAItemProps {
    item: QAType;
    onUpdate: (updatedItem: QAType) => void;
    onDelete: (itemId: string) => void;
}

const statusColorMap: Record<StudyStatus, string> = {
    unseen: 'border-transparent',
    correct: 'border-green-500',
    wrong: 'border-red-500',
    skipped: 'border-yellow-500',
};

const QAItem: React.FC<QAItemProps> = ({ item, onUpdate, onDelete }) => {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const { isFlagged = false } = item;

    const setStatus = (status: StudyStatus) => {
        onUpdate({ ...item, studyStatus: status });
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 relative group border-l-4 ${isFlagged ? 'border-orange-400' : statusColorMap[item.studyStatus]}`}>
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                    icon={<Flag className={`w-4 h-4 ${isFlagged ? 'fill-orange-400 text-orange-500' : ''}`} />}
                    tooltip={isFlagged ? 'Remove Flag' : 'Flag as difficult'}
                    onClick={() => onUpdate({ ...item, isFlagged: !isFlagged })}
                    className="hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-500"
                />
                <IconButton 
                    icon={<Trash2 className="w-4 h-4" />} 
                    tooltip="Delete Q&A"
                    onClick={() => onDelete(item.id)}
                    className="hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"
                />
            </div>
            <div className="mb-3 pr-20">
                <EditableField value={item.question} onSave={(newValue) => onUpdate({ ...item, question: newValue })} isQuestion />
            </div>

            {isAnswerVisible && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <EditableField value={item.answer} onSave={(newValue) => onUpdate({ ...item, answer: newValue })} />
                </div>
            )}

            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 mr-2 transition-transform duration-300 ${isAnswerVisible ? 'rotate-180' : ''}`} />
                    {isAnswerVisible ? 'Hide Answer' : 'Reveal Answer'}
                </button>
                {isAnswerVisible && (
                     <div className="flex items-center space-x-1">
                        <IconButton icon={<CheckCircle2 className="w-5 h-5 text-green-500"/>} tooltip="Correct" onClick={() => setStatus('correct')} className="hover:bg-green-100 dark:hover:bg-green-900/50"/>
                        <IconButton icon={<XCircle className="w-5 h-5 text-red-500"/>} tooltip="Wrong" onClick={() => setStatus('wrong')} className="hover:bg-red-100 dark:hover:bg-red-900/50"/>
                        <IconButton icon={<SkipForward className="w-5 h-5 text-yellow-500"/>} tooltip="Skip" onClick={() => setStatus('skipped')} className="hover:bg-yellow-100 dark:hover:bg-yellow-900/50"/>
                    </div>
                )}
            </div>
        </div>
    );
};

interface QASectionProps {
    knowledgeQA: QAType[];
    scenarioQA: QAType[];
    setKnowledgeQA: (qa: QAType[]) => void;
    setScenarioQA: (qa: QAType[]) => void;
}

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
            isActive
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-l border-t border-r -mb-px text-blue-600 dark:text-blue-400'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
    >
        {label}
    </button>
)

const OrderToggleButton: React.FC<{ order: 'sequential' | 'randomized'; setOrder: (order: 'sequential' | 'randomized') => void; }> = ({ order, setOrder }) => (
     <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
        <button
            onClick={() => setOrder('sequential')}
            className={`flex items-center px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                order === 'sequential' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
        >
            <ListOrdered className="w-4 h-4 mr-1.5" />
            Sequential
        </button>
        <button
            onClick={() => setOrder('randomized')}
            className={`flex items-center px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                order === 'randomized' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-600 dark:text-slate-300'
            }`}
        >
            <Shuffle className="w-4 h-4 mr-1.5" />
            Randomized
        </button>
    </div>
);

const QAList: React.FC<{
    items: QAType[], 
    onUpdate: (item: QAType) => void, 
    onDelete: (id: string) => void,
    type: 'knowledge' | 'scenario'
}> = ({ items, onUpdate, onDelete, type}) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-10 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <h3 className="text-lg font-semibold">No Questions Generated</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The AI couldn't create {type} questions from the text.</p>
            </div>
        )
    }
    return (
        <div className="space-y-4">
            {items.map(item => <QAItem key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete}/>)}
        </div>
    )
}

const QASection: React.FC<QASectionProps> = ({ knowledgeQA, scenarioQA, setKnowledgeQA, setScenarioQA }) => {
    const [activeTab, setActiveTab] = useState<'knowledge' | 'scenario'>('knowledge');
    const [cardOrder, setCardOrder] = useState<'sequential' | 'randomized'>('sequential');

    const displayedKnowledgeQA = useMemo(() => {
        if (cardOrder === 'randomized') {
            return [...knowledgeQA].sort(() => Math.random() - 0.5);
        }
        return knowledgeQA;
    }, [knowledgeQA, cardOrder]);

    const displayedScenarioQA = useMemo(() => {
        if (cardOrder === 'randomized') {
            return [...scenarioQA].sort(() => Math.random() - 0.5);
        }
        return scenarioQA;
    }, [scenarioQA, cardOrder]);

    const updateKnowledgeItem = (updatedItem: QAType) => {
        setKnowledgeQA(knowledgeQA.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const deleteKnowledgeItem = (itemId: string) => {
        setKnowledgeQA(knowledgeQA.filter(item => item.id !== itemId));
    };
    
    const updateScenarioItem = (updatedItem: QAType) => {
        setScenarioQA(scenarioQA.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const deleteScenarioItem = (itemId: string) => {
        setScenarioQA(scenarioQA.filter(item => item.id !== itemId));
    };
    
    return (
        <div id="qa-section">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold">Generated Q&A</h2>
                 <div className="flex items-center space-x-4">
                    <OrderToggleButton order={cardOrder} setOrder={setCardOrder} />
                    <div className="flex items-center space-x-2">
                        <IconButton 
                            icon={<FileText className="w-4 h-4" />} 
                            tooltip="Export as CSV" 
                            onClick={() => exportQAToCSV(knowledgeQA, scenarioQA)} 
                        />
                        <IconButton 
                            icon={<Download className="w-4 h-4" />} 
                            tooltip="Export as PDF" 
                            onClick={() => exportQAToPDF(knowledgeQA, scenarioQA)} 
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="flex -mb-px" aria-label="Tabs">
                     <TabButton label={`Knowledge Questions (${knowledgeQA.length})`} isActive={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
                     <TabButton label={`Scenario-Based Questions (${scenarioQA.length})`} isActive={activeTab === 'scenario'} onClick={() => setActiveTab('scenario')} />
                </nav>
            </div>
            
            <div id="qa-content">
                {activeTab === 'knowledge' && (
                    <QAList 
                        items={displayedKnowledgeQA}
                        onUpdate={updateKnowledgeItem}
                        onDelete={deleteKnowledgeItem}
                        type="knowledge"
                    />
                )}
                 {activeTab === 'scenario' && (
                    <QAList 
                        items={displayedScenarioQA}
                        onUpdate={updateScenarioItem}
                        onDelete={deleteScenarioItem}
                        type="scenario"
                    />
                )}
            </div>
        </div>
    );
};

export default QASection;