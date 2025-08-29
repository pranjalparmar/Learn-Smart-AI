import React, { useState } from 'react';
import { Illustration } from '../types';
import { Download, X, Maximize } from 'lucide-react';
import IconButton from './IconButton';

const IllustrationCard: React.FC<{ illustration: Illustration, onEnlarge: () => void }> = ({ illustration, onEnlarge }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden group">
        <div className="relative">
            <img src={`data:image/png;base64,${illustration.imageBase64}`} alt={illustration.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                 <IconButton icon={<Maximize />} tooltip="Enlarge" onClick={onEnlarge} className="text-white hover:bg-white/20" />
                 <a href={`data:image/png;base64,${illustration.imageBase64}`} download={`${illustration.title}.png`}>
                    <IconButton icon={<Download />} tooltip="Download" className="text-white hover:bg-white/20" />
                 </a>
            </div>
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{illustration.title}</h3>
        </div>
    </div>
);

const ImageModal: React.FC<{ illustration: Illustration, onClose: () => void }> = ({ illustration, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={`data:image/png;base64,${illustration.imageBase64}`} alt={illustration.title} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button onClick={onClose} className="absolute -top-4 -right-4 text-white bg-slate-800 rounded-full p-2 hover:bg-slate-700">
                <X className="w-6 h-6" />
            </button>
        </div>
    </div>
);


const VisualAids: React.FC<{ illustrations: Illustration[] }> = ({ illustrations }) => {
    const [enlargedIllustration, setEnlargedIllustration] = useState<Illustration | null>(null);

    if (illustrations.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">No Visual Aids Generated</h2>
                <p className="text-slate-500 dark:text-slate-400">The AI did not find any concepts in your document that would strongly benefit from a diagram.</p>
            </div>
        );
    }
    
    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Generated Visual Aids</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {illustrations.map(illus => (
                    <IllustrationCard key={illus.id} illustration={illus} onEnlarge={() => setEnlargedIllustration(illus)} />
                ))}
            </div>
            {enlargedIllustration && (
                <ImageModal illustration={enlargedIllustration} onClose={() => setEnlargedIllustration(null)} />
            )}
        </div>
    );
};

export default VisualAids;