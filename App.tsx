import React, { useState, useCallback, useMemo } from 'react';
import { AppState, View, Flashcard, QA, StudyTopicNode, GeneratedTopicNode, StudyStatus, GeneratedContentPayload, ConceptNode } from './types';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import FlashcardList from './components/FlashcardList';
import QASection from './components/QASection';
import ProgressTracker from './components/ProgressTracker';
import Chatbot from './components/Chatbot';
import MiniGame from './components/MiniGame';
import ConceptMap from './components/ConceptMap';
import { useSettings } from './contexts/SettingsContext';
import { extractText } from './services/fileProcessor';
import { 
    generateConceptMapStructure,
    populateTopicWithContent,
} from './services/geminiService';
import { BrainCircuit, FileUp, Sun, Moon } from 'lucide-react';
import IconButton from './components/IconButton';

type ActiveTab = 'flashcards' | 'qa' | 'progress' | 'chatbot' | 'concept-map';

const App: React.FC = () => {
    const { theme, setTheme } = useSettings();
    const [appState, setAppState] = useState<AppState>({
        view: View.Upload,
        loadingMessage: '',
        progress: 0,
        studyTopics: null,
        sourceText: '',
        error: null,
    });
    const [activeTab, setActiveTab] = useState<ActiveTab>('concept-map');
    const [gameSkipped, setGameSkipped] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    const resetState = useCallback(() => {
        setAppState({
            view: View.Upload,
            loadingMessage: '',
            progress: 0,
            studyTopics: null,
            sourceText: '',
            error: null,
        });
        setActiveTab('concept-map');
        setGameSkipped(false);
        setSelectedTopicId(null);
    }, []);
    
    // Recursively adds studyStatus, unique IDs, and loading state to the data.
    const processGeneratedTopics = (nodes: GeneratedTopicNode[]): StudyTopicNode[] => {
        const now = Date.now();
        let counter = 0;
        const traverse = (nodes: GeneratedTopicNode[]): StudyTopicNode[] => {
             return nodes.map(node => ({
                ...node,
                isContentLoaded: false, // Initially, content is not loaded
                flashcards: (node.flashcards || []).map((fc) => ({ ...fc, id: `fc-${now}-${counter++}`, studyStatus: 'unseen' })),
                knowledgeQA: (node.knowledgeQA || []).map((qa) => ({ ...qa, id: `kq-${now}-${counter++}`, studyStatus: 'unseen' })),
                scenarioQA: (node.scenarioQA || []).map((qa) => ({ ...qa, id: `sq-${now}-${counter++}`, studyStatus: 'unseen' })),
                children: node.children ? traverse(node.children) : undefined,
            }));
        };
        return traverse(nodes);
    };
    
    // Recursively merges new content into the correct node in the state tree
    const mergeTopicContent = (nodes: StudyTopicNode[], topicId: string, content: GeneratedContentPayload): StudyTopicNode[] => {
        const now = Date.now();
        let counter = 0;
        return nodes.map(node => {
            if (node.id === topicId) {
                return {
                    ...node,
                    isContentLoaded: true,
                    flashcards: content.flashcards.map(fc => ({ ...fc, id: `fc-${now}-${counter++}`, studyStatus: 'unseen' })),
                    knowledgeQA: content.knowledgeQA.map(qa => ({ ...qa, id: `kq-${now}-${counter++}`, studyStatus: 'unseen' })),
                    scenarioQA: content.scenarioQA.map(qa => ({ ...qa, id: `sq-${now}-${counter++}`, studyStatus: 'unseen' })),
                };
            }
            if (node.children) {
                return { ...node, children: mergeTopicContent(node.children, topicId, content) };
            }
            return node;
        });
    };

    const handleFileUpload = async (files: FileList) => {
        if (files.length === 0) return;
        
        const timings = { total: 0, extraction: 0, structureGeneration: 0 };
        const totalStartTime = performance.now();

        resetState();
        setAppState(prev => ({ ...prev, view: View.Loading, loadingMessage: 'Preparing to upload...', progress: 0, error: null }));
        
        try {
            // 1. Text Extraction
            setAppState(prev => ({ ...prev, loadingMessage: 'Extracting text from file(s)...', progress: 5 }));
            const extractionStartTime = performance.now();
            const combinedText = await Array.from(files).reduce(async (accPromise, file, i, arr) => {
                const acc = await accPromise;
                const progress = 5 + ((i + 1) / arr.length) * 15;
                setAppState(prev => ({ ...prev, loadingMessage: `Extracting text from ${file.name}...`, progress}));
                const text = await extractText(file);
                return acc + text + '\n\n';
            }, Promise.resolve(''));
            timings.extraction = performance.now() - extractionStartTime;

            if (!combinedText.trim()) throw new Error("No text could be extracted from the file(s).");
            setAppState(prev => ({ ...prev, sourceText: combinedText, progress: 20 }));

            // 2. Generate Concept Map Structure
            setAppState(prev => ({ ...prev, loadingMessage: 'Phase 1: Analyzing document structure...', progress: 25 }));
            const structureStartTime = performance.now();
            const generatedStructure = await generateConceptMapStructure(combinedText);
            timings.structureGeneration = performance.now() - structureStartTime;
            
            if (!generatedStructure || generatedStructure.length === 0) throw new Error("The AI failed to generate a study structure.");
            
            const studyTopicsWithStructure = processGeneratedTopics(generatedStructure);

            // 3. Set initial structure and switch view
            setAppState(prev => ({
                ...prev,
                studyTopics: studyTopicsWithStructure,
                view: View.Results, // Switch to results view immediately
                loadingMessage: 'Phase 2: Generating content...',
                progress: 50
            }));

            // 4. In parallel, populate content for each main topic
            const contentPromises = studyTopicsWithStructure.map(topic =>
                populateTopicWithContent(topic.label, combinedText)
                    .then(content => {
                        setAppState(prev => ({
                            ...prev,
                            studyTopics: mergeTopicContent(prev.studyTopics!, topic.id, content),
                        }));
                    })
                    .catch(error => {
                        console.error(`Failed to generate content for topic "${topic.label}":`, error);
                        // Mark as loaded to remove spinner, even on error
                         setAppState(prev => ({
                            ...prev,
                            studyTopics: mergeTopicContent(prev.studyTopics!, topic.id, { flashcards: [], knowledgeQA: [], scenarioQA: [] }),
                        }));
                    })
            );

            await Promise.all(contentPromises); // Wait for all content to be fetched

            setAppState(prev => ({ ...prev, progress: 100, loadingMessage: 'All content generated!' }));
            
            timings.total = performance.now() - totalStartTime;
            console.log("--- Learn Smart AI Performance Timings ---");
            console.log(`Text Extraction: ${timings.extraction.toFixed(2)} ms`);
            console.log(`Structure Generation: ${timings.structureGeneration.toFixed(2)} ms`);
            console.log("-------------------------------------------");
            console.log(`Total Time (including parallel content fetch): ${timings.total.toFixed(2)} ms`);
            console.log("-------------------------------------------");

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAppState(prev => ({ ...prev, view: View.Error, error: `Failed to process file. ${errorMessage}`, progress: 0 }));
        }
    };

    const updateStudyItem = useCallback((itemToUpdate: Flashcard | QA) => {
        const isFlashcard = itemToUpdate.id.startsWith('fc-');
        const isKnowledgeQA = itemToUpdate.id.startsWith('kq-');
        
        const updateInTree = (nodes: StudyTopicNode[]): StudyTopicNode[] => {
            return nodes.map(node => {
                if (
                    (isFlashcard && !node.flashcards.some(fc => fc.id === itemToUpdate.id)) &&
                    (isKnowledgeQA && !node.knowledgeQA.some(qa => qa.id === itemToUpdate.id)) &&
                    (!isFlashcard && !isKnowledgeQA && !node.scenarioQA.some(qa => qa.id === itemToUpdate.id)) &&
                    !node.children
                ) {
                    return node;
                }
                
                return {
                    ...node,
                    flashcards: isFlashcard 
                        ? node.flashcards.map(fc => fc.id === itemToUpdate.id ? (itemToUpdate as Flashcard) : fc)
                        : node.flashcards,
                    knowledgeQA: isKnowledgeQA 
                        ? node.knowledgeQA.map(qa => qa.id === itemToUpdate.id ? (itemToUpdate as QA) : qa)
                        : node.knowledgeQA,
                    scenarioQA: (!isFlashcard && !isKnowledgeQA)
                        ? node.scenarioQA.map(qa => qa.id === itemToUpdate.id ? (itemToUpdate as QA) : qa)
                        : node.scenarioQA,
                    children: node.children ? updateInTree(node.children) : undefined,
                };
            });
        };

        setAppState(prev => {
            if (!prev.studyTopics) return prev;
            return {
                ...prev,
                studyTopics: updateInTree(prev.studyTopics),
            };
        });
    }, []);

    const deleteStudyItem = useCallback((itemId: string) => {
        const isFlashcard = itemId.startsWith('fc-');
        const isKnowledgeQA = itemId.startsWith('kq-');

        const deleteInTree = (nodes: StudyTopicNode[]): StudyTopicNode[] => {
            return nodes.map(node => ({
                ...node,
                flashcards: isFlashcard ? node.flashcards.filter(fc => fc.id !== itemId) : node.flashcards,
                knowledgeQA: isKnowledgeQA ? node.knowledgeQA.filter(qa => qa.id !== itemId) : node.knowledgeQA,
                scenarioQA: (!isFlashcard && !isKnowledgeQA) ? node.scenarioQA.filter(qa => qa.id !== itemId) : node.scenarioQA,
                children: node.children ? deleteInTree(node.children) : undefined,
            }));
        };

        setAppState(prev => {
            if (!prev.studyTopics) return prev;
            return {
                ...prev,
                studyTopics: deleteInTree(prev.studyTopics),
            };
        });
    }, []);

    const allFlashcards = useMemo(() => {
        if (!appState.studyTopics) return [];
        const getAll = (nodes: StudyTopicNode[]): Flashcard[] => {
            return nodes.reduce((acc, node) => {
                acc.push(...node.flashcards);
                if (node.children) {
                    acc.push(...getAll(node.children));
                }
                return acc;
            }, [] as Flashcard[]);
        };
        return getAll(appState.studyTopics);
    }, [appState.studyTopics]);
    
    const allKnowledgeQA = useMemo(() => {
         if (!appState.studyTopics) return [];
        const getAll = (nodes: StudyTopicNode[]): QA[] => {
            return nodes.reduce((acc, node) => {
                acc.push(...node.knowledgeQA);
                if (node.children) {
                    acc.push(...getAll(node.children));
                }
                return acc;
            }, [] as QA[]);
        };
        return getAll(appState.studyTopics);
    }, [appState.studyTopics]);

    const allScenarioQA = useMemo(() => {
        if (!appState.studyTopics) return [];
        const getAll = (nodes: StudyTopicNode[]): QA[] => {
            return nodes.reduce((acc, node) => {
                acc.push(...node.scenarioQA);
                if (node.children) {
                    acc.push(...getAll(node.children));
                }
                return acc;
            }, [] as QA[]);
        };
        return getAll(appState.studyTopics);
    }, [appState.studyTopics]);

    const allItemsByMainTopic = useMemo(() => {
        if (!appState.studyTopics) {
            return new Map<string, { flashcards: Flashcard[], knowledgeQA: QA[], scenarioQA: QA[] }>();
        }

        const itemMap = new Map<string, { flashcards: Flashcard[], knowledgeQA: QA[], scenarioQA: QA[] }>();

        const collectRecursively = (node: StudyTopicNode): { flashcards: Flashcard[], knowledgeQA: QA[], scenarioQA: QA[] } => {
            let flashcards = [...node.flashcards];
            let knowledgeQA = [...node.knowledgeQA];
            let scenarioQA = [...node.scenarioQA];

            if (node.children) {
                for (const child of node.children) {
                    const childItems = collectRecursively(child);
                    flashcards.push(...childItems.flashcards);
                    knowledgeQA.push(...childItems.knowledgeQA);
                    scenarioQA.push(...childItems.scenarioQA);
                }
            }
            return { flashcards, knowledgeQA, scenarioQA };
        };

        for (const mainTopic of appState.studyTopics) {
            itemMap.set(mainTopic.id, collectRecursively(mainTopic));
        }

        return itemMap;
    }, [appState.studyTopics]);

    const findMainTopicId = (nodes: StudyTopicNode[], childId: string): string | null => {
        for (const mainTopic of nodes) {
            if (mainTopic.id === childId) {
                return mainTopic.id;
            }
            
            const searchInChildren = (currentNode: StudyTopicNode): boolean => {
                if (currentNode.id === childId) {
                    return true;
                }
                if (currentNode.children) {
                    return currentNode.children.some(child => searchInChildren(child));
                }
                return false;
            };

            if (searchInChildren(mainTopic)) {
                return mainTopic.id;
            }
        }
        return null;
    };
    
    const handleConceptMapNodeClick = useCallback((node: ConceptNode) => {
        if (!appState.studyTopics) return;
        
        const mainTopicId = findMainTopicId(appState.studyTopics, node.id);
        
        if (mainTopicId) {
            setSelectedTopicId(mainTopicId);
            setActiveTab('flashcards');
        }
    }, [appState.studyTopics]);
        
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
                       {activeTab === 'flashcards' && <FlashcardList studyTopics={appState.studyTopics} allFlashcards={allFlashcards} allItemsByMainTopic={allItemsByMainTopic} onUpdate={updateStudyItem} onDelete={deleteStudyItem} selectedTopicId={selectedTopicId} onSelectedTopicHandled={() => setSelectedTopicId(null)} />}
                       {activeTab === 'qa' && <QASection studyTopics={appState.studyTopics} allKnowledgeQA={allKnowledgeQA} allScenarioQA={allScenarioQA} allItemsByMainTopic={allItemsByMainTopic} onUpdate={updateStudyItem} onDelete={deleteStudyItem} />}
                       {activeTab === 'progress' && <ProgressTracker studyTopics={appState.studyTopics} />}
                       {activeTab === 'chatbot' && <Chatbot sourceText={appState.sourceText} />}
                       {activeTab === 'concept-map' && <ConceptMap conceptMapData={appState.studyTopics} onNodeClick={handleConceptMapNodeClick} />}
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
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Learn Smart AI</h1>
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