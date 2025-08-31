import React, { useState } from 'react';
import { ConceptNode, ConceptMapData } from '../types';
import { ChevronRight, ChevronDown } from 'lucide-react';

const ConceptMapNode: React.FC<{
    node: ConceptNode;
    level: number;
    onNodeClick: (node: ConceptNode) => void;
}> = ({ node, level, onNodeClick }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const nodeHeader = (
        <div className="flex items-center group w-full">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (hasChildren) setIsExpanded(!isExpanded);
                }}
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${!hasChildren ? 'invisible' : ''}`}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
                {hasChildren && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
            </button>
            <div 
                className="flex-grow ml-2 cursor-pointer"
                onClick={() => onNodeClick(node)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNodeClick(node); }}
            >
                <span className="font-semibold text-slate-700 dark:text-slate-200">{node.label}</span>
            </div>
        </div>
    );
    
    if (level === 0) {
        return (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md mb-6 transition-all duration-300 ease-in-out hover:shadow-lg dark:hover:shadow-blue-900/30">
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-xl transition-colors">
                    {nodeHeader}
                </div>
                {isExpanded && hasChildren && (
                    <div className="pl-6 pr-4 pb-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="relative mt-4">
                            <div className="absolute left-3 top-0 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-600 rounded"></div>
                            <div className="space-y-1">
                                {node.children?.map(child => (
                                    <ConceptMapNode
                                        key={child.id}
                                        node={child}
                                        level={level + 1}
                                        onNodeClick={onNodeClick}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    return (
         <div className="relative pl-6">
            <div className="flex items-center group hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md py-1 pr-2">
                <div className="absolute left-[12px] top-1/2 -mt-px w-3 h-0.5 bg-slate-200 dark:bg-slate-600"></div>
                {nodeHeader}
            </div>
            {isExpanded && hasChildren && (
                <div className="relative mt-1">
                    <div className="absolute left-3 top-0 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    <div className="space-y-1">
                        {node.children?.map(child => (
                             <ConceptMapNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onNodeClick={onNodeClick}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ConceptMap: React.FC<{ 
    conceptMapData: ConceptMapData | null;
    onNodeClick: (node: ConceptNode) => void; 
}> = ({ conceptMapData, onNodeClick }) => {
    if (!conceptMapData || conceptMapData.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Concept Map Not Generated</h2>
                <p className="text-slate-500 dark:text-slate-400">The AI could not generate a hierarchical outline from the document.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 px-2">Concept Map</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                {conceptMapData.map(node => (
                    <ConceptMapNode
                        key={node.id}
                        node={node}
                        level={0}
                        onNodeClick={onNodeClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default ConceptMap;