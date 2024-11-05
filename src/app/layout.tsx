// src/app/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import GameSidebar from '@/components/GameSidebar';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';


export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { gameId } = useParams();

    const isInGameRoute = pathname.includes(`/games/${gameId}`);

    return (
        <html lang="en">
            <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
                <ThemeProvider>
                    <div className="flex">
                        {/* Sidebar for game-specific navigation */}
                        {isInGameRoute && <GameSidebar />}

                        {/* Main content area with top-level navigation */}
                        <main className={`${isInGameRoute ? 'ml-64' : ''} flex-1`}>
                            <header className="bg-gray-900 text-white p-4 flex justify-between">
                                <nav className="space-x-4">
                                    <Link href="/">
                                        <span className="hover:underline">Home</span>
                                    </Link>
                                    <Link href="/new-game">
                                        <span className="hover:underline">New Game</span>
                                    </Link>
                                    {/* Add any other non-game-specific links here */}
                                </nav>
                            </header>
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
