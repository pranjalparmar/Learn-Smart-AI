import React, { useMemo, useState } from 'react';
import { Flashcard as FlashcardType } from '../types';
import { exportFlashcardsToCSV, exportFlashcardsToPDF } from '../services/exportService';
import { Download, FileText, Shuffle, ListOrdered } from 'lucide-react';
import IconButton from './IconButton';
import Flashcard from './Flashcard';

interface FlashcardListProps {
    flashcards: FlashcardType[];
    setFlashcards: (flashcards: FlashcardType[]) => void;
}

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


const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, setFlashcards }) => {
    const [cardOrder, setCardOrder] = useState<'sequential' | 'randomized'>('sequential');

    const displayedFlashcards = useMemo(() => {
        if (cardOrder === 'randomized') {
            return [...flashcards].sort(() => Math.random() - 0.5);
        }
        return flashcards;
    }, [flashcards, cardOrder]);

    const updateCard = (updatedCard: FlashcardType) => {
        setFlashcards(flashcards.map(c => c.id === updatedCard.id ? updatedCard : c));
    };

    const deleteCard = (cardId: string) => {
        setFlashcards(flashcards.filter(c => c.id !== cardId));
    };
    
    return (
        <div id="flashcard-section">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Generated Flashcards ({flashcards.length})</h2>
                <div className="flex items-center space-x-4">
                    <OrderToggleButton order={cardOrder} setOrder={setCardOrder} />
                    <div className="flex items-center space-x-2">
                        <IconButton 
                            icon={<FileText className="w-4 h-4" />} 
                            tooltip="Export as CSV" 
                            onClick={() => exportFlashcardsToCSV(flashcards)}
                        />
                        <IconButton 
                            icon={<Download className="w-4 h-4" />} 
                            tooltip="Export as PDF" 
                            onClick={() => exportFlashcardsToPDF(flashcards)} 
                        />
                    </div>
                </div>
            </div>
            
            {flashcards.length === 0 ? (
                <div className="text-center py-10 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <h3 className="text-lg font-semibold">No Flashcards Generated</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The AI couldn't create flashcards from the provided text.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedFlashcards.map(card => (
                        <Flashcard key={card.id} card={card} onUpdate={updateCard} onDelete={deleteCard} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlashcardList;