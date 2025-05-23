"use client";

import {usePathname} from 'next/navigation';
import GameSidebar from '@/components/GameSidebar';
import '@/styles/globals.css';
import {ThemeProvider} from '@/context/ThemeContext';
import MainNav from '@/components/MainNav';
import {Analytics} from "@vercel/analytics/react"
import React from "react";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const gameId = pathname.split('/games/')[1]?.split('/')[0] || '';

    const isInGameRoute = pathname.includes(`/games/${gameId}`);

    return (
        <html lang="en">
        <body
            className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
        <ThemeProvider>
            <div className="flex min-h-screen">
                {isInGameRoute && (
                    <div className="w-48 fixed">
                        <GameSidebar params={Promise.resolve({gameId})}/>
                    </div>
                )}
                <main className={`${isInGameRoute ? 'ml-48' : ''} flex-1`}>
                    <MainNav/>
                    {children}
                </main>
            </div>
        </ThemeProvider>
        <Analytics/>
        </body>
        </html>
    );
}
