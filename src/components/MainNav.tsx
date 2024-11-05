"use client";

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function MainNav() {
    const { toggleDarkMode } = useTheme();

    return (
        <header className="bg-primary-light dark:bg-primary-dark text-white p-4 flex justify-between transition-colors">
            <nav className="space-x-4">
                <Link href="/" className="hover:underline">Home</Link>
                <Link href="/new-game" className="hover:underline">New Game</Link>
                <button onClick={toggleDarkMode} className="hover:underline ml-4">
                    Toggle Dark Mode
                </button>
            </nav>
        </header>
    );
}
