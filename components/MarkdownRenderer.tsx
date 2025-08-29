import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const renderContent = () => {
        let html = content;
        
        // Blockquotes
        html = html.replace(/^> (.*$)/gmi, '<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-2">$1</blockquote>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Newlines
        html = html.replace(/\n/g, '<br />');

        // Replace blockquote line breaks to preserve structure
        html = html.replace(/<\/blockquote><br \/>/g, '</blockquote>');

        return { __html: html };
    };

    return <div className="text-sm prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={renderContent()} />;
};

export default MarkdownRenderer;