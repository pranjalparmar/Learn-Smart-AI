
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    tooltip: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, tooltip, className, ...props }) => {
    return (
        <div className="relative group">
            <button
                {...props}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                    className || 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
                {icon}
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {tooltip}
            </div>
        </div>
    );
};

export default IconButton;
