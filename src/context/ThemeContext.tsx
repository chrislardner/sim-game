"use client";

import {createContext, ReactNode, useCallback, useContext, useSyncExternalStore} from 'react';

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Theme store for useSyncExternalStore
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

function getSnapshot(): boolean {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
}

function getServerSnapshot(): boolean {
    return true; // Default dark mode for SSR
}

function setTheme(dark: boolean) {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    // Notify all subscribers
    listeners.forEach(listener => listener());
}

export function ThemeProvider({children}: Readonly<{ children: ReactNode }>) {
    const isDarkMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const toggleDarkMode = useCallback(() => {
        setTheme(!getSnapshot());
    }, []);

    return (
        <ThemeContext.Provider value={{isDarkMode, toggleDarkMode}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}