"use client";

import React, {useEffect, useState} from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import MainNav from "@/components/nav/MainNav";
import GameSidebar from "@/components/nav/GameSidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/cn";
import {loadGameData} from "@/data/storage";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const match = pathname.match(/^\/games\/([^/]+)/);
    const gameId = match?.[1] ?? "";
    const hasSidebar = Boolean(match);
    const [userTeamId, setUserTeamId] = useState<number>(0);

    useEffect(() => {
        let isMounted = true;

        async function fetchUserTeam() {
            if (!gameId) {
                if (isMounted) setUserTeamId(0);
                return;
            }
            try {
                const data = await loadGameData(Number(gameId));
                if (isMounted) setUserTeamId(data?.selectedTeamId);
            } catch (error) {
                console.error("Failed to load game data:", error);
                if (isMounted) setUserTeamId(0);
            }
        }

        fetchUserTeam();
        return () => {
            isMounted = false;
        };
    }, [gameId]);
    return (
        <html lang="en" className="dark">
        <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
        <ThemeProvider>
            <div className={cn(hasSidebar && "md:grid md:grid-cols-[12rem_minmax(0,1fr)]", "min-h-screen")}>
                {hasSidebar && (
                    <aside className="hidden md:block sticky top-0 h-screen border-r border-neutral-200 dark:border-neutral-800 bg-surface-light dark:bg-surface-dark">
                        <GameSidebar gameId={gameId} teamId={userTeamId.toString() || "0"} />
                    </aside>
                )}

                <div className="flex min-h-screen flex-col overflow-x-hidden">
                    <MainNav />
                    <main className="flex-1">
                        <Container>{children}</Container>
                    </main>
                    <footer id="site-footer">
                        <Container>
                            <Footer />
                        </Container>
                    </footer>
                </div>
            </div>
            <Analytics />
        </ThemeProvider>
        </body>
        </html>
    );
}
