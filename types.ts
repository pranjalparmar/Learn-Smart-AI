export type StudyStatus = 'unseen' | 'correct' | 'wrong' | 'skipped';

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    studyStatus: StudyStatus;
    isFlagged?: boolean;
}

export interface QA {
    id: string;
    question: string;
    answer: string;
    studyStatus: StudyStatus;
    isFlagged?: boolean;
}

// FIX: Add missing Illustration type for VisualAids component.
export interface Illustration {
    id: string;
    title: string;
    imageBase64: string;
}

// FIX: Add missing types for ConceptMap component.
export interface ConceptNode {
    id: string;
    label: string;
    children?: ConceptNode[];
}

export type ConceptMapData = ConceptNode[];

export enum View {
    Upload,
    Loading,
    Results,
    Error,
}

export interface AppState {
    view: View;
    loadingMessage: string;
    progress: number;
    flashcards: Flashcard[];
    knowledgeQA: QA[];
    scenarioQA: QA[];
    sourceText: string;
    error: string | null;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    isError?: boolean;
}

// FIX: Add missing PracticeSet type for PracticeDashboard component.
export interface PracticeSet {
    id: string;
    name: string;
    itemIds: string[];
}


export type Theme = 'light' | 'dark';

// FIX: Add missing types for settings feature
export type CardOrder = 'sequential' | 'randomized';
export type FontSize = 'sm' | 'md' | 'lg';

export interface Settings {
    theme: Theme;
    cardOrder: CardOrder;
    fontSize: FontSize;
}