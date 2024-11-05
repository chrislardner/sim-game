"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadAllGames, deleteGameData } from '@/data/storage';
import { Game } from '@/types/game';

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        async function fetchData() {
            const savedGames = await loadAllGames();
            setGames(savedGames || []);
        }
        fetchData();
    }, []);

    const deleteGame = async (gameId: number) => {
        await deleteGameData(gameId);
        setGames(prevGames => prevGames.filter(game => game.gameId !== gameId));
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-primary-light dark:text-primary-dark">Saved Games</h1>
                <Link href="/new-game">
                    <button className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg transition hover:bg-accent">
                        New Game
                    </button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                    <div key={game.gameId} className="relative p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                        <Link href={`/games/${game.gameId}`}>
                            <h2 className="text-xl font-bold mb-2 text-accent">Game {game.gameId}</h2>
                            <p className="text-gray-700 dark:text-gray-300">Current Year: <span className="font-semibold">{game.currentYear}</span></p>
                            <p className="text-gray-700 dark:text-gray-300">Current Week: <span className="font-semibold">{game.currentWeek}</span></p>
                            <p className="text-gray-700 dark:text-gray-300">Game Phase: <span className="font-semibold">{game.gamePhase}</span></p>
                        </Link>
                        <button 
                            onClick={() => deleteGame(game.gameId)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
