import React from 'react';
import { Layers3, MessageSquareQuote, ListChecks, Bot, Network } from 'lucide-react';

type Tab = 'flashcards' | 'qa' | 'progress' | 'chatbot' | 'concept-map';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const NavButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-2">
                <NavButton
                    icon={<Network className="h-5 w-5" />}
                    label="Concept Map"
                    isActive={activeTab === 'concept-map'}
                    onClick={() => setActiveTab('concept-map')}
                />
                <NavButton
                    icon={<Layers3 className="h-5 w-5" />}
                    label="Flashcards"
                    isActive={activeTab === 'flashcards'}
                    onClick={() => setActiveTab('flashcards')}
                />
                <NavButton
                    icon={<MessageSquareQuote className="h-5 w-5" />}
                    label="Q&A"
                    isActive={activeTab === 'qa'}
                    onClick={() => setActiveTab('qa')}
                />
                 <NavButton
                    icon={<Bot className="h-5 w-5" />}
                    label="Ask Anything"
                    isActive={activeTab === 'chatbot'}
                    onClick={() => setActiveTab('chatbot')}
                />
                <NavButton
                    icon={<ListChecks className="h-5 w-5" />}
                    label="Progress Tracker"
                    isActive={activeTab === 'progress'}
                    onClick={() => setActiveTab('progress')}
                />
            </nav>
        </aside>
    );
};

export default Sidebar;