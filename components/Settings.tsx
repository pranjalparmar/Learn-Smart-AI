import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Settings, Theme, CardOrder, FontSize } from '../types';
import { X, Sun, Moon, Shuffle, ListOrdered, CaseSensitive } from 'lucide-react';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsOption: React.FC<{ title: string; children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="py-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <div className="flex space-x-2">{children}</div>
    </div>
);

const SettingButton = <T extends string>({ value, selectedValue, onClick, children }: { value: T, selectedValue: T, onClick: (value: T) => void; children: React.ReactNode }) => (
    <button
        onClick={() => onClick(value)}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all w-full text-center ${
            selectedValue === value
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
        }`}
    >
        {children}
    </button>
);

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const {
        theme, setTheme,
        cardOrder, setCardOrder,
        fontSize, setFontSize,
    } = useSettings();

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        aria-label="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col">
                    <SettingsOption title="Color Theme" icon={<Moon className="w-4 h-4" />}>
                        <SettingButton value="light" selectedValue={theme} onClick={setTheme}>Light</SettingButton>
                        <SettingButton value="dark" selectedValue={theme} onClick={setTheme}>Dark</SettingButton>
                    </SettingsOption>

                    <SettingsOption title="Card Order" icon={<Shuffle className="w-4 h-4" />}>
                        {/* FIX: Corrected a typo in the closing tag of the SettingButton component. */}
                        <SettingButton value="sequential" selectedValue={cardOrder} onClick={setCardOrder}>Sequential</SettingButton>
                        <SettingButton value="randomized" selectedValue={cardOrder} onClick={setCardOrder}>Randomized</SettingButton>
                    </SettingsOption>

                    <SettingsOption title="Font Size" icon={<CaseSensitive className="w-4 h-4" />}>
                        <SettingButton value="sm" selectedValue={fontSize} onClick={setFontSize}>Small</SettingButton>
                        <SettingButton value="md" selectedValue={fontSize} onClick={setFontSize}>Medium</SettingButton>
                        <SettingButton value="lg" selectedValue={fontSize} onClick={setFontSize}>Large</SettingButton>
                    </SettingsOption>
                </div>
            </div>
        </div>
    );
};

export default Settings;