export type StudyStatus = 'unseen' | 'correct' | 'wrong' | 'skipped';

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    studyStatus: StudyStatus;
    isFlagged?: boolean;
}

export interface QA {
    id:string;
    question: string;
    answer: string;
    studyStatus: StudyStatus;
    isFlagged?: boolean;
}

export interface Illustration {
    id: string;
    title: string;
    imageBase64: string;
}

export interface ConceptNode {
    id:string;
    label: string;
    children?: ConceptNode[];
}

export type ConceptMapData = ConceptNode[];


// The raw response from the Gemini API
export interface GeneratedTopicNode extends Omit<ConceptNode, 'children'> {
    flashcards?: Omit<Flashcard, 'id' | 'studyStatus' | 'isFlagged'>[];
    knowledgeQA?: Omit<QA, 'id' | 'studyStatus' | 'isFlagged'>[];
    scenarioQA?: Omit<QA, 'id' | 'studyStatus' | 'isFlagged'>[];
    children?: GeneratedTopicNode[];
}

// Payload for content generation for a single topic
export interface GeneratedContentPayload {
    flashcards: Omit<Flashcard, 'id' | 'studyStatus' | 'isFlagged'>[];
    knowledgeQA: Omit<QA, 'id' | 'studyStatus' | 'isFlagged'>[];
    scenarioQA: Omit<QA, 'id' | 'studyStatus' | 'isFlagged'>[];
}


// The data structure used within the application's state, with statuses and unique IDs
export interface StudyTopicNode extends Omit<ConceptNode, 'children'> {
    isContentLoaded: boolean;
    flashcards: Flashcard[];
    knowledgeQA: QA[];
    scenarioQA: QA[];
    children?: StudyTopicNode[];
}

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
    studyTopics: StudyTopicNode[] | null;
    sourceText: string;
    error: string | null;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    isError?: boolean;
}

export interface PracticeSet {
    id: string;
    name: string;
    itemIds: string[];
}

export type Theme = 'light' | 'dark';

export type CardOrder = 'sequential' | 'randomized';
export type FontSize = 'sm' | 'md' | 'lg';

export interface Settings {
    theme: Theme;
    cardOrder: CardOrder;
    fontSize: FontSize;
}

// FIX: Add ExamResult and related types for the exam feature.
export interface ExamAnswer {
    itemId: string;
    question: string;
    answer: string;
    userAnswer: StudyStatus;
}

export interface ExamResult {
    totalQuestions: number;
    score: number;
    timeTaken: number; // in seconds
    topics: string[];
    answers: ExamAnswer[];
}