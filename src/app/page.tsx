'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadAllGames, deleteGameData } from '@/data/storage';
import { Game } from '@/types/game';

export default function Home() {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        const savedGames = await loadAllGames();
        setGames(savedGames);
    };

    const handleDelete = async (gameId: number) => {
        await deleteGameData(gameId);
        fetchGames(); // Refresh the game list after deletion
    };

    return (
        <div>
            <h1>Saved Games</h1>
            {games.length > 0 ? (
                <ul>
                    {games.map((game) => (
                        <li key={game.gameId} className="flex items-center space-x-4">
                            <Link href={`/games/${game.gameId}`}>
                                View Game {game.gameId} - {game.currentYear}
                            </Link>
                            <button
                                onClick={() => handleDelete(game.gameId)}
                                className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No saved games found.</p>
            )}
        </div>
    );
}
