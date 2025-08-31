import React, { useState } from 'react';
import { QA as QAType, StudyStatus, StudyTopicNode, Flashcard } from '../types';
import { exportQAToCSV, exportQAToPDF } from '../services/exportService';
import { Download, FileText, Trash2, ChevronDown, CheckCircle2, XCircle, SkipForward, Flag, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';
import ContentLoader from './ContentLoader';

interface EditableFieldProps {
    value: string;
    onSave: (newValue: string) => void;
    isQuestion?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = React.memo(({ value, onSave, isQuestion = false }) => {
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
});


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

const QAItem: React.FC<QAItemProps> = React.memo(({ item, onUpdate, onDelete }) => {
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
});

interface QASectionProps {
    studyTopics: StudyTopicNode[] | null;
    allKnowledgeQA: QAType[];
    allScenarioQA: QAType[];
    allItemsByMainTopic: Map<string, { flashcards: Flashcard[], knowledgeQA: QAType[], scenarioQA: QAType[] }>;
    onUpdate: (item: QAType) => void;
    onDelete: (id: string) => void;
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

interface MainTopicQAProps {
    topic: StudyTopicNode;
    knowledgeItems: QAType[];
    scenarioItems: QAType[];
    onUpdate: (item: QAType) => void;
    onDelete: (id: string) => void;
    type: 'knowledge' | 'scenario';
    isInitiallyExpanded: boolean;
}

const MainTopicQA: React.FC<MainTopicQAProps> = React.memo(({ topic, knowledgeItems, scenarioItems, onUpdate, onDelete, type, isInitiallyExpanded }) => {
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
    
    const itemsToShow = type === 'knowledge' ? knowledgeItems : scenarioItems;
    const shouldShowLoader = !topic.isContentLoaded;
    const hasContent = itemsToShow.length > 0;

    if (!hasContent && topic.isContentLoaded) return null;

     return (
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 first:mt-0 first:border-t-0 pt-4 first:pt-0">
            <div className="flex items-center">
                 <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-left w-full p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronRight className={`w-5 h-5 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <h3 className="text-lg font-semibold flex-grow">{topic.label} 
                        {!shouldShowLoader && <span className="text-sm font-normal text-slate-500"> ({itemsToShow.length})</span>}
                    </h3>
                </button>
            </div>
            {isExpanded && (
                <div className="pl-4 pt-2">
                    {shouldShowLoader ? (
                        <ContentLoader message={`Generating Q&A for ${topic.label}...`} />
                    ) : (
                        <div className="space-y-4 my-4">
                            {itemsToShow.map(item => <QAItem key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete}/>)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

const QASection: React.FC<QASectionProps> = ({ studyTopics, allKnowledgeQA, allScenarioQA, allItemsByMainTopic, onUpdate, onDelete }) => {
    const [activeTab, setActiveTab] = useState<'knowledge' | 'scenario'>('knowledge');
    
    return (
        <div id="qa-section">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold">Generated Q&A</h2>
                 <div className="flex items-center space-x-2">
                    <IconButton 
                        icon={<FileText className="w-4 h-4" />} 
                        tooltip="Export as CSV" 
                        onClick={() => exportQAToCSV(allKnowledgeQA, allScenarioQA)} 
                        disabled={allKnowledgeQA.length === 0 && allScenarioQA.length === 0}
                    />
                    <IconButton 
                        icon={<Download className="w-4 h-4" />} 
                        tooltip="Export as PDF" 
                        onClick={() => exportQAToPDF(allKnowledgeQA, allScenarioQA)} 
                        disabled={allKnowledgeQA.length === 0 && allScenarioQA.length === 0}
                    />
                </div>
            </div>

            <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                <nav className="flex -mb-px" aria-label="Tabs">
                     <TabButton label={`Knowledge Questions (${allKnowledgeQA.length})`} isActive={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
                     <TabButton label={`Scenario-Based Questions (${allScenarioQA.length})`} isActive={activeTab === 'scenario'} onClick={() => setActiveTab('scenario')} />
                </nav>
            </div>
            
            <div id="qa-content" className="bg-white dark:bg-slate-800/50 rounded-lg shadow-inner p-4">
                {(!studyTopics) ? (
                     <div className="text-center py-10">
                        <h3 className="text-lg font-semibold">No Questions Generated</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The AI couldn't create questions from the text.</p>
                    </div>
                ) : (
                    studyTopics.map((topic, index) => {
                        const topicItems = allItemsByMainTopic.get(topic.id) || { knowledgeQA: [], scenarioQA: [] };
                        return (
                            <MainTopicQA 
                                key={topic.id}
                                topic={topic}
                                knowledgeItems={topicItems.knowledgeQA}
                                scenarioItems={topicItems.scenarioQA}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                type={activeTab}
                                isInitiallyExpanded={index === 0}
                            />
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default QASection;