"use client";

import {usePathname, useRouter} from 'next/navigation';
import {use, useEffect} from 'react';


export default function GameSidebar({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const router = useRouter();
    const pathname = usePathname();
    const {gameId} = use(params);

    useEffect(() => {
        if (!gameId || !pathname.includes(`/games/${gameId}`)) {
            console.log("whoops, couldn't find gameId in pathname for the sidebar", gameId, pathname);
        }
    }, [gameId, pathname]);

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <aside
            className="w-48 h-full bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark fixed p-4 transition-colors">
            <h2 className="text-lg font-bold mb-4">Menu</h2>
            <ul className="space-y-2">
                <li>
                    <button onClick={() => handleNavigation(`/games/${gameId}`)}
                            className="hover:text-accent">Dashboard
                    </button>
                </li>
                <li>
                    <button onClick={() => handleNavigation(`/games/${gameId}/teams`)}
                            className="hover:text-accent">Teams
                    </button>
                </li>
                <li>
                    <button onClick={() => handleNavigation(`/games/${gameId}/players`)}
                            className="hover:text-accent">Players
                    </button>
                </li>
                <li>
                    <button onClick={() => handleNavigation(`/games/${gameId}/schedule`)}
                            className="hover:text-accent">Schedule
                    </button>
                </li>
                <li>
                    <button onClick={() => handleNavigation(`/games/${gameId}/races`)}
                            className="hover:text-accent">Races
                    </button>
                </li>
            </ul>
        </aside>
    );
}
