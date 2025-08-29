import React, { useState } from 'react';
import { Flashcard as FlashcardType, StudyStatus } from '../types';
import { Check, RotateCcw, Trash2, CheckCircle2, XCircle, SkipForward, Flag } from 'lucide-react';
import IconButton from './IconButton';

interface EditableFieldProps {
    value: string;
    onSave: (newValue: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };

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
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap cursor-pointer" onClick={() => setIsEditing(true)}>
            {value}
        </p>
    );
};


interface FlashcardProps {
    card: FlashcardType;
    onUpdate: (updatedCard: FlashcardType) => void;
    onDelete: (cardId: string) => void;
}

const statusColorMap: Record<StudyStatus, string> = {
    unseen: 'border-transparent',
    correct: 'border-green-500',
    wrong: 'border-red-500',
    skipped: 'border-yellow-500',
};

const Flashcard: React.FC<FlashcardProps> = ({ card, onUpdate, onDelete }) => {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const { isFlagged = false } = card;

    const setStatus = (status: StudyStatus) => {
        onUpdate({ ...card, studyStatus: status });
    };

    return (
        <div className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex flex-col transition-all duration-300 group border-l-4 ${isFlagged ? 'border-orange-400' : statusColorMap[card.studyStatus]}`}>
            <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                    icon={<Flag className={`w-4 h-4 ${isFlagged ? 'fill-orange-400 text-orange-500' : ''}`} />}
                    tooltip={isFlagged ? 'Remove Flag' : 'Flag as difficult'}
                    onClick={() => onUpdate({ ...card, isFlagged: !isFlagged })}
                    className="hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-500"
                />
                <IconButton 
                    icon={<Trash2 className="w-4 h-4" />} 
                    tooltip="Delete Card"
                    onClick={() => onDelete(card.id)}
                    className="hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500"
                />
            </div>

            <div className="font-semibold text-lg mb-4 flex-grow pr-16">
                <EditableField value={card.question} onSave={(newValue) => onUpdate({ ...card, question: newValue })} />
            </div>

            {isAnswerVisible && (
                <div className="mt-4 border-t pt-4 dark:border-slate-700 flex-grow">
                     <EditableField value={card.answer} onSave={(newValue) => onUpdate({ ...card, answer: newValue })} />
                </div>
            )}
            
            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => setIsAnswerVisible(!isAnswerVisible)}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    <RotateCcw className={`w-4 h-4 mr-2 transition-transform duration-300 ${isAnswerVisible ? 'rotate-180' : ''}`} />
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

export default Flashcard;