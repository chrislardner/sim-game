"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import MainNav from "@/components/nav/MainNav";
import GameSidebar from "@/components/nav/GameSidebar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/cn";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const match = pathname.match(/^\/games\/([^/]+)/);
    const gameId = match?.[1] ?? "";
    const hasSidebar = Boolean(match);

    return (
        <html lang="en" className="dark">
        <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
        <ThemeProvider>
            <div className={cn(hasSidebar ? "md:grid md:grid-cols-[12rem_1fr]" : "", "min-h-screen")}>
                {hasSidebar && (
                    <aside
                        className="
                  hidden md:block
                  sticky top-0 h-screen
                  border-r border-neutral-200 dark:border-neutral-800
                  bg-surface-light dark:bg-surface-dark
                  overflow-y-auto
                "
                    >
                        <GameSidebar gameId={gameId} />
                    </aside>
                )}

                <div className="flex min-h-screen flex-col">
                    <MainNav />
                    <main className="flex-1">{children}</main>
                    <footer id="site-footer">
                        <Footer />
                    </footer>
                </div>
            </div>

            <Analytics />
        </ThemeProvider>
        </body>
        </html>
    );
}
