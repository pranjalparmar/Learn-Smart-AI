import React from 'react';

interface ContentLoaderProps {
    message: string;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({ message }) => {
    return (
        <div className="w-full p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse">
            <div className="flex flex-col items-center justify-center space-y-4">
                 <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                 <div className="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                 <div className="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">{message}</p>
            </div>
        </div>
    );
};

export default ContentLoader;
