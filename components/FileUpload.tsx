
import React, { useState, useCallback } from 'react';
import { UploadCloud, Sparkles, BookOpen } from 'lucide-react';

interface FileUploadProps {
    onFileUpload: (files: FileList) => void;
}

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="mb-4 text-blue-500">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileUpload(files);
        }
    }, [onFileUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileUpload(files);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-4xl text-center">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">Unlock Your Study Potential</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
                    Transform your lecture notes, textbooks, and study guides into powerful, interactive learning tools in seconds.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                     <InfoCard 
                        icon={<UploadCloud size={40} />} 
                        title="1. Upload Your Notes" 
                        description="Drag and drop or select your PDF, TXT, DOCX, or PPTX files. The more context, the better."
                     />
                     <InfoCard 
                        icon={<Sparkles size={40} />} 
                        title="2. AI-Powered Generation" 
                        description="Our AI instantly analyzes your material to create flashcards, Q&A, and concept maps."
                     />
                     <InfoCard 
                        icon={<BookOpen size={40} />} 
                        title="3. Study & Export" 
                        description="Review your new materials, track your progress, and export for offline study."
                     />
                </div>

                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-all duration-300 ${
                        isDragging ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-105' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50'
                    }`}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.docx,.pptx,.doc,.ppt"
                        multiple
                    />
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 pointer-events-none">
                        <UploadCloud className={`h-16 w-16 mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                            Drag & drop your files here
                        </p>
                        <p className="mt-1 text-sm">or <span className="font-semibold text-blue-600 dark:text-blue-400">click to browse</span></p>
                        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Supports PDF, TXT, DOCX, PPTX files</p>
                         <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">(.doc & .ppt files have limited support and should be saved as modern formats)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;