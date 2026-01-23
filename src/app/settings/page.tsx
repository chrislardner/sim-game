"use client";

import {useTheme} from '@/context/ThemeContext';

export default function Settings() {
    const {isDarkMode, toggleDarkMode} = useTheme();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="flex items-center space-x-2">
                <label className="text-lg">Dark Mode:</label>
                <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-sm ${isDarkMode ? 'bg-blue-600' : 'bg-neutral-400'} text-white`}
                >
                    {isDarkMode ? 'Disable' : 'Enable'}
                </button>
            </div>
        </div>
    );
}
