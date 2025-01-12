"use client";

import { usePathname } from 'next/navigation';
import GameSidebar from '@/components/GameSidebar';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import MainNav from '@/components/MainNav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const gameId = pathname.split('/games/')[1]?.split('/')[0] || '';

    const isInGameRoute = pathname.includes(`/games/${gameId}`);

    return (
        <html lang="en">
            <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
                <ThemeProvider>
                    <div className="flex">
                        {/* Sidebar for game-specific navigation */}
                        {isInGameRoute && <GameSidebar params={Promise.resolve({ gameId })} />}
                        <main className={`${isInGameRoute ? 'ml-64' : ''} flex-1`}>
                            <MainNav />
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
