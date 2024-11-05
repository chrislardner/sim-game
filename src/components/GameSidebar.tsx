"use client";

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function GameSidebar() {
    const { gameId } = useParams();
    const pathname = usePathname();

    if (!pathname.includes(`/games/${gameId}`)) return null;

    return (
        <aside className="w-64 h-full bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark fixed p-4 transition-colors">
            <h2 className="text-lg font-bold mb-4">Game Menu</h2>
            <ul className="space-y-2">
                <li><Link href={`/games/${gameId}`} className="hover:text-accent">Dashboard</Link></li>
                <li><Link href={`/games/${gameId}/teams`} className="hover:text-accent">Teams</Link></li>
                <li><Link href={`/games/${gameId}/players`} className="hover:text-accent">Players</Link></li>
                <li><Link href={`/games/${gameId}/schedule`} className="hover:text-accent">Schedule</Link></li>
                <li><Link href={`/games/${gameId}/playoffs`} className="hover:text-accent">Playoffs</Link></li>
            </ul>
        </aside>
    );
}
