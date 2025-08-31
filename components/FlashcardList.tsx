import React, { useState, useRef, useEffect } from 'react';
import { Flashcard as FlashcardType, StudyTopicNode, QA } from '../types';
import { exportFlashcardsToCSV, exportFlashcardsToPDF } from '../services/exportService';
import { Download, FileText, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';
import Flashcard from './Flashcard';
import ContentLoader from './ContentLoader';

interface MainTopicFlashcardsProps {
    topic: StudyTopicNode;
    flashcards: FlashcardType[];
    onUpdate: (card: FlashcardType) => void;
    onDelete: (cardId: string) => void;
    isInitiallyExpanded: boolean;
}

const MainTopicFlashcards: React.FC<MainTopicFlashcardsProps> = React.memo(({ topic, flashcards, onUpdate, onDelete, isInitiallyExpanded }) => {
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
    const shouldShowLoader = !topic.isContentLoaded;
    const hasFlashcards = flashcards.length > 0;
    
    useEffect(() => {
        setIsExpanded(isInitiallyExpanded);
    }, [isInitiallyExpanded]);

    if (!hasFlashcards && topic.isContentLoaded) {
        return null;
    }

    return (
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 first:mt-0 first:border-t-0 pt-4 first:pt-0">
            <div className="flex items-center">
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-left w-full p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ChevronRight className={`w-5 h-5 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <h3 className="text-lg font-semibold flex-grow">{topic.label} 
                        {!shouldShowLoader && <span className="text-sm font-normal text-slate-500"> ({flashcards.length})</span>}
                    </h3>
                </button>
            </div>
            {isExpanded && (
                <div className="pl-4 pt-2">
                    {shouldShowLoader ? (
                        <ContentLoader message={`Generating flashcards for ${topic.label}...`} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-4">
                            {flashcards.map(card => (
                                <Flashcard key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

interface FlashcardListProps {
    studyTopics: StudyTopicNode[] | null;
    allFlashcards: FlashcardType[];
    allItemsByMainTopic: Map<string, { flashcards: FlashcardType[], knowledgeQA: QA[], scenarioQA: QA[] }>;
    onUpdate: (card: FlashcardType) => void;
    onDelete: (cardId: string) => void;
    selectedTopicId: string | null;
    onSelectedTopicHandled: () => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ studyTopics, allFlashcards, allItemsByMainTopic, onUpdate, onDelete, selectedTopicId, onSelectedTopicHandled }) => {
    const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (selectedTopicId && topicRefs.current[selectedTopicId]) {
            const element = topicRefs.current[selectedTopicId];
            
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

            element?.classList.add('bg-blue-100', 'dark:bg-blue-900/50', 'transition-colors', 'duration-300', 'p-2', 'rounded-lg');
            
            const timeoutId = setTimeout(() => {
                element?.classList.remove('bg-blue-100', 'dark:bg-blue-900/50', 'p-2', 'rounded-lg');
                onSelectedTopicHandled();
            }, 2000);

            return () => clearTimeout(timeoutId);
        }
    }, [selectedTopicId, onSelectedTopicHandled]);

    return (
        <div id="flashcard-section">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Generated Flashcards ({allFlashcards.length})</h2>
                <div className="flex items-center space-x-2">
                    <IconButton 
                        icon={<FileText className="w-4 h-4" />} 
                        tooltip="Export as CSV" 
                        onClick={() => exportFlashcardsToCSV(allFlashcards)}
                        disabled={allFlashcards.length === 0}
                    />
                    <IconButton 
                        icon={<Download className="w-4 h-4" />} 
                        tooltip="Export as PDF" 
                        onClick={() => exportFlashcardsToPDF(allFlashcards)} 
                        disabled={allFlashcards.length === 0}
                    />
                </div>
            </div>
            
            {(!studyTopics) ? (
                <div className="text-center py-10 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold">No Flashcards Generated</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The AI couldn't create flashcards from the provided text.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-inner p-4">
                    {studyTopics.map((topic, index) => {
                        const topicFlashcards = allItemsByMainTopic.get(topic.id)?.flashcards || [];
                        const isInitiallyExpanded = selectedTopicId ? topic.id === selectedTopicId : index === 0;
                        
                        return (
                           <div key={topic.id} ref={el => { if (el) topicRefs.current[topic.id] = el; }}>
                               <MainTopicFlashcards 
                                   topic={topic}
                                   flashcards={topicFlashcards}
                                   onUpdate={onUpdate}
                                   onDelete={onDelete}
                                   isInitiallyExpanded={isInitiallyExpanded}
                               />
                           </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default FlashcardList;