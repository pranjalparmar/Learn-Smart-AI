import React, { useState, useCallback } from 'react';
import { AppState, View, Flashcard, QA } from './types';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import FlashcardList from './components/FlashcardList';
import QASection from './components/QASection';
import ProgressTracker from './components/ProgressTracker';
import Chatbot from './components/Chatbot';
import MiniGame from './components/MiniGame';
import { useSettings } from './contexts/SettingsContext';
import { extractText } from './services/fileProcessor';
import { 
    generateFlashcards, 
    generateKnowledgeQA, 
    generateScenarioQA,
} from './services/geminiService';
import { BrainCircuit, FileUp, Sun, Moon } from 'lucide-react';
import IconButton from './components/IconButton';

const App: React.FC = () => {
    // FIX: Destructure theme and setTheme from useSettings to fix undefined variable errors.
    const { theme, setTheme } = useSettings();
    const [appState, setAppState] = useState<AppState>({
        view: View.Upload,
        loadingMessage: '',
        progress: 0,
        flashcards: [],
        knowledgeQA: [],
        scenarioQA: [],
        sourceText: '',
        error: null,
    });
    const [activeTab, setActiveTab] = useState<'flashcards' | 'qa' | 'progress' | 'chatbot'>('flashcards');
    const [gameSkipped, setGameSkipped] = useState(false);

    const resetState = useCallback(() => {
        setAppState({
            view: View.Upload,
            loadingMessage: '',
            progress: 0,
            flashcards: [],
            knowledgeQA: [],
            scenarioQA: [],
            sourceText: '',
            error: null,
        });
        setActiveTab('flashcards');
        setGameSkipped(false);
    }, []);

    const handleFileUpload = async (files: FileList) => {
        if (files.length === 0) return;
        
        resetState();
        setAppState(prev => ({ ...prev, view: View.Loading, loadingMessage: 'Preparing to upload...', progress: 0, error: null }));
        
        try {
            let combinedText = '';
            const filesArray = Array.from(files);
            
            for (let i = 0; i < filesArray.length; i++) {
                const file = filesArray[i];
                const progress = 5 + ((i + 1) / filesArray.length) * 20;
                setAppState(prev => ({ ...prev, loadingMessage: `Extracting text from ${file.name}...`, progress}));
                const text = await extractText(file);
                combinedText += text + '\n\n';
            }

            if (!combinedText.trim()) {
                throw new Error("No text could be extracted from the file(s). Please check the content.");
            }
            
            setAppState(prev => ({ 
                ...prev, 
                sourceText: combinedText,
                loadingMessage: 'Generating study materials... This may take a moment.', 
                progress: 25,
            }));

            const promises: Promise<any>[] = [];

            const flashcardPromise = generateFlashcards(combinedText)
                .then(flashcards => {
                    setAppState(prev => ({
                        ...prev,
                        flashcards: flashcards.map(f => ({ ...f, studyStatus: 'unseen' })),
                        progress: prev.progress + 25,
                    }));
                })
                .catch(err => {
                    console.error("Failed to generate flashcards:", err);
                    setAppState(prev => ({...prev, progress: prev.progress + 25}));
                });
            promises.push(flashcardPromise);
            
            const knowledgeQAPromise = generateKnowledgeQA(combinedText)
                .then(knowledgeQA => {
                    setAppState(prev => ({
                        ...prev,
                        knowledgeQA: knowledgeQA.map(q => ({...q, studyStatus: 'unseen' })),
                        progress: prev.progress + 25,
                    }));
                })
                .catch(err => {
                    console.error("Failed to generate knowledge QA:", err);
                    setAppState(prev => ({...prev, progress: prev.progress + 25}));
                });
            promises.push(knowledgeQAPromise);
            
            const scenarioQAPromise = generateScenarioQA(combinedText)
                .then(scenarioQA => {
                     setAppState(prev => ({
                        ...prev,
                        scenarioQA: scenarioQA.map(q => ({...q, studyStatus: 'unseen' })),
                        progress: prev.progress + 25,
                    }));
                })
                .catch(err => {
                    console.error("Failed to generate scenario QA:", err);
                    setAppState(prev => ({...prev, progress: prev.progress + 25}));
                });
            promises.push(scenarioQAPromise);

            await Promise.allSettled(promises);

            setAppState(prev => {
                if (prev.flashcards.length === 0 && prev.knowledgeQA.length === 0 && prev.scenarioQA.length === 0) {
                    return { 
                        ...prev, 
                        view: View.Error, 
                        error: "Failed to generate any study materials. Please check the file content or try again.",
                        progress: 0 
                    };
                }
                return { ...prev, view: View.Results, progress: 100, loadingMessage: 'Done!' };
            });

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAppState(prev => ({ ...prev, view: View.Error, error: `Failed to process file. ${errorMessage}`, progress: 0 }));
        }
    };
    
    const renderContent = () => {
        switch (appState.view) {
            case View.Loading:
                if (gameSkipped) {
                    return <Loader message={appState.loadingMessage} progress={appState.progress} />;
                }
                return (
                    <MiniGame
                        onSkip={() => setGameSkipped(true)}
                        progress={appState.progress}
                        loadingMessage={appState.loadingMessage}
                    />
                );
            case View.Results:
                return (
                    <div className="p-4 sm:p-6 lg:p-8">
                       {activeTab === 'flashcards' && <FlashcardList flashcards={appState.flashcards} setFlashcards={(newFlashcards) => setAppState(p => ({...p, flashcards: newFlashcards}))} />}
                       {activeTab === 'qa' && <QASection knowledgeQA={appState.knowledgeQA} scenarioQA={appState.scenarioQA} setKnowledgeQA={(newQA) => setAppState(p => ({...p, knowledgeQA: newQA}))} setScenarioQA={(newQA) => setAppState(p => ({...p, scenarioQA: newQA}))} />}
                       {activeTab === 'progress' && <ProgressTracker flashcards={appState.flashcards} knowledgeQA={appState.knowledgeQA} scenarioQA={appState.scenarioQA} />}
                       {activeTab === 'chatbot' && <Chatbot sourceText={appState.sourceText} />}
                    </div>
                );
            case View.Error:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">{appState.error}</p>
                        <button onClick={resetState} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Try Again
                        </button>
                    </div>
                );
            case View.Upload:
            default:
                return <FileUpload onFileUpload={handleFileUpload} />;
        }
    };
    
    return (
        <div className={`min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans`}>
            <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 bg-white dark:bg-slate-800 z-10 flex-shrink-0 h-16">
                <div className="flex items-center space-x-3">
                    <BrainCircuit className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">IntelliStudy AI</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Turn Your Notes Into Knowledge—Instantly.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {appState.view === View.Results && (
                        <button onClick={resetState} className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
                            <FileUp className="h-4 w-4" />
                            <span>Upload New</span>
                        </button>
                    )}
                     <IconButton 
                        icon={theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} 
                        tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} 
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                     />
                </div>
            </header>
            <div className="flex-1 flex">
                {appState.view === View.Results && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;