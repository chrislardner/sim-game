"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadAllGames, deleteGameData, deleteAllGames } from '@/data/storage';
import { Game } from '@/types/game';

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

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

    const deleteAllGameData = async () => {
        await deleteAllGames();
        setGames([]);
        setShowModal(false);
    };

    const handleNewGameClick = () => {
        router.push('/new-game');
    };

    const handleGameClick = (gameId: number) => {
        router.push(`/games/${gameId}`);
    };

    return (
        <div className="p-4 relative min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-primary-light dark:text-primary-dark">Saved Games</h1>
                <button
                    onClick={handleNewGameClick}
                    className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg transition hover:bg-accent"
                >
                    New Game
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                    <div
                        key={game.gameId}
                        className="relative p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors cursor-pointer"
                        onClick={() => handleGameClick(game.gameId)}
                    >
                        <h2 className="text-xl font-bold mb-2 text-accent">Game {game.gameId}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Current Year: <span className="font-semibold">{game.currentYear}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Current Week: <span className="font-semibold">{game.currentWeek}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Game Phase: <span className="font-semibold">{game.gamePhase}</span></p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteGame(game.gameId);
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            {games.length > 0 && (
                <button
                    onClick={() => setShowModal(true)}
                    className="fixed bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg transition hover:bg-red-700"
                >
                    Delete All Games
                </button>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Are you sure?</h2>
                        <p className="mb-4">This action will delete all saved games. Are you sure you want to proceed?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 mr-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg transition hover:bg-gray-400 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAllGameData}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg transition hover:bg-red-700"
                            >
                                Yes, I&apos;m Sure
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
