import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// FIX: Import new types to support settings feature
import { Theme, Settings, CardOrder, FontSize } from '../types';

// FIX: Update context type to include new settings
interface SettingsContextType extends Settings {
    setTheme: (theme: Theme) => void;
    setCardOrder: (cardOrder: CardOrder) => void;
    setFontSize: (fontSize: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// FIX: Update initial settings to include card order and font size
const getInitialSettings = (): Settings => {
    try {
        const item = window.localStorage.getItem('appSettings');
        const savedSettings = item ? JSON.parse(item) : {};
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        return {
            theme: savedSettings.theme || (prefersDarkMode ? 'dark' : 'light'),
            cardOrder: savedSettings.cardOrder || 'sequential',
            fontSize: savedSettings.fontSize || 'md',
        };
    } catch (error) {
        console.error("Could not read settings from localStorage", error);
        return {
            theme: 'light',
            cardOrder: 'sequential',
            fontSize: 'md',
        };
    }
};


export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    useEffect(() => {
        try {
            window.localStorage.setItem('appSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Could not save settings to localStorage", error);
        }
    }, [settings]);

    // FIX: Add effect to manage font size class on root element along with theme
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(settings.theme);

        root.classList.remove('text-sm', 'text-base', 'text-lg');
        if (settings.fontSize === 'sm') {
            root.classList.add('text-sm');
        } else if (settings.fontSize === 'lg') {
            root.classList.add('text-lg');
        } else {
            root.classList.add('text-base');
        }
    }, [settings.theme, settings.fontSize]);

    // FIX: Add setters for new settings
    const setTheme = (theme: Theme) => setSettings(s => ({ ...s, theme }));
    const setCardOrder = (cardOrder: CardOrder) => setSettings(s => ({ ...s, cardOrder }));
    const setFontSize = (fontSize: FontSize) => setSettings(s => ({ ...s, fontSize }));

    // FIX: Provide new settings and setters in context value
    const value = {
        ...settings,
        setTheme,
        setCardOrder,
        setFontSize,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
