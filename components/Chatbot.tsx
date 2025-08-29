import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { Send, Bot, User, CornerDownLeft } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatbotProps {
    sourceText: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ sourceText }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: trimmedInput,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponseText = await generateChatResponse(trimmedInput, sourceText);
            const botMessage: ChatMessage = {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text: botResponseText,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                sender: 'bot',
                text: "Sorry, I encountered an error trying to get a response. Please try again.",
                isError: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-150px)] bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">Ask Anything</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions based on your uploaded documents.</p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg rounded-tl-none">
                            <p className="text-sm">Hi there! I'm your AI study assistant. Ask me anything about the content you've uploaded, and I'll do my best to answer based on the material provided.</p>
                        </div>
                    </div>
                    {messages.map(message => (
                        <div key={message.id} className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'bot' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                            <div className={`p-3 rounded-lg max-w-lg ${message.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : message.isError 
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-tl-none'
                                : 'bg-slate-100 dark:bg-slate-700 rounded-tl-none'
                            }`}>
                                <MarkdownRenderer content={message.text} />
                            </div>
                             {message.sender === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg rounded-tl-none flex items-center space-x-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your question here..."
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;