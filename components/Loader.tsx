
import React from 'react';

interface LoaderProps {
    message: string;
    progress: number;
}

const Loader: React.FC<LoaderProps> = ({ message, progress }) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent mb-6"></div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Processing Your Notes...</h2>

            <div className="w-full max-w-md flex items-center mb-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[40px] text-right">{Math.round(progress)}%</span>
            </div>
            
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">{message}</p>
        </div>
    );
};

export default Loader;
