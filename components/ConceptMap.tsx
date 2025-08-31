import React, { useState, useEffect } from 'react';
import { ConceptNode, ConceptMapData } from '../types';
import { ChevronRight, ChevronDown, Pencil, Trash2, Check, X } from 'lucide-react';
import IconButton from './IconButton';

// Recursive helper to update a node's label immutably
const updateNodeLabelRecursively = (nodes: ConceptNode[], nodeId: string, newLabel: string): ConceptNode[] => {
    return nodes.map(node => {
        if (node.id === nodeId) {
            return { ...node, label: newLabel };
        }
        if (node.children && node.children.length > 0) {
            return { ...node, children: updateNodeLabelRecursively(node.children, nodeId, newLabel) };
        }
        return node;
    });
};

// Recursive helper to delete a node immutably
const deleteNodeRecursively = (nodes: ConceptNode[], nodeId: string): ConceptNode[] => {
    return nodes
        .filter(node => node.id !== nodeId)
        .map(node => {
            if (node.children && node.children.length > 0) {
                return { ...node, children: deleteNodeRecursively(node.children, nodeId) };
            }
            return node;
        });
};

// Recursive rendering component for each item in the outline
const OutlineNode: React.FC<{
    node: ConceptNode;
    level: number;
    isExpanded: boolean;
    onToggle: (nodeId: string) => void;
    onUpdate: (nodeId: string, newLabel: string) => void;
    onDelete: (nodeId: string) => void;
    renderChildren: (nodes: ConceptNode[], level: number) => React.ReactNode;
}> = ({ node, level, isExpanded, onToggle, onUpdate, onDelete, renderChildren }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(node.label);

    const handleSave = () => {
        if (editText.trim()) {
            onUpdate(node.id, editText.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(node.label);
        setIsEditing(false);
    };

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div style={{ paddingLeft: `${level * 1.5}rem` }}>
            <div className="flex items-center group hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md py-1.5 pr-2">
                <button onClick={() => hasChildren && onToggle(node.id)} className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {hasChildren && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </button>
                {isEditing ? (
                    <div className="flex-grow flex items-center">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 bg-transparent border border-blue-500 rounded-md focus:outline-none"
                        />
                        <IconButton icon={<Check className="w-4 h-4 text-green-500" />} tooltip="Save" onClick={handleSave} />
                        <IconButton icon={<X className="w-4 h-4 text-red-500" />} tooltip="Cancel" onClick={handleCancel} />
                    </div>
                ) : (
                    <span className="flex-grow cursor-pointer" onClick={() => setIsEditing(true)}>
                        {node.label}
                    </span>
                )}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton icon={<Pencil className="w-4 h-4" />} tooltip="Rename" onClick={() => setIsEditing(true)} />
                    <IconButton icon={<Trash2 className="w-4 h-4 text-red-500" />} tooltip="Delete" onClick={() => onDelete(node.id)} />
                </div>
            </div>
            {isExpanded && hasChildren && (
                <div className="mt-1">
                    {renderChildren(node.children, level + 1)}
                </div>
            )}
        </div>
    );
};

const ConceptMap: React.FC<{ conceptMapData: ConceptMapData | null }> = ({ conceptMapData }) => {
    const [map, setMap] = useState<ConceptMapData>([]);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (conceptMapData) {
            // Deep copy to make it editable locally
            setMap(JSON.parse(JSON.stringify(conceptMapData)));
            // Auto-expand all nodes by default for full visibility initially
            const allNodeIds: Record<string, boolean> = {};
            const expandAll = (nodes: ConceptNode[]) => {
                nodes.forEach(node => {
                    allNodeIds[node.id] = true;
                    if (node.children && node.children.length > 0) {
                        expandAll(node.children);
                    }
                });
            };
            expandAll(conceptMapData);
            setExpandedNodes(allNodeIds);
        }
    }, [conceptMapData]);

    const handleToggle = (nodeId: string) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const handleUpdate = (nodeId: string, newLabel: string) => {
        setMap(currentMap => updateNodeLabelRecursively(currentMap, nodeId, newLabel));
    };

    const handleDelete = (nodeId: string) => {
        setMap(currentMap => deleteNodeRecursively(currentMap, nodeId));
    };
    
    const renderNodes = (nodes: ConceptNode[], level: number): React.ReactNode => {
        return nodes.map(node => (
            <OutlineNode
                key={node.id}
                node={node}
                level={level}
                isExpanded={!!expandedNodes[node.id]}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                renderChildren={renderNodes}
            />
        ));
    };

    if (!map || map.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Concept Map Not Generated</h2>
                <p className="text-slate-500 dark:text-slate-400">The AI could not generate a hierarchical outline from the document.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Concept Map Outline</h2>
            <div className="flex-grow bg-white dark:bg-slate-800/50 rounded-lg shadow-inner p-4 overflow-y-auto">
                <div className="space-y-1">
                    {renderNodes(map, 0)}
                </div>
            </div>
        </div>
    );
};

export default ConceptMap;