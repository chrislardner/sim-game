"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadPlayers } from '@/data/storage';
import { Player } from '@/types/player';
import { use } from 'react';

export default function PlayersPage({ params }: { params: Promise<{ gameId: string }> }) {
    const router = useRouter();
    const { gameId } = use(params);
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const playersData = await loadPlayers(Number(gameId));
                setPlayers(playersData);
            }
            fetchData();
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    const handlePlayerClick = (playerId: number) => {
        router.push(`/games/${gameId}/players/${playerId}`);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Players</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map(player => (
                    <div
                        key={player.playerId}
                        className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors cursor-pointer"
                        onClick={() => handlePlayerClick(player.playerId)}
                    >
                        <h2 className="text-xl font-bold mb-2 text-accent">{player.firstName} {player.lastName}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Year: <span className="font-semibold">{player.year}</span></p>
                            <p className="text-gray-700 dark:text-gray-300">Event Type: <span className="font-semibold">
                                {player.seasons.join(', ')}
                            </span></p>
                        </div>
                ))}
            </div>
        </div>
    );
}
