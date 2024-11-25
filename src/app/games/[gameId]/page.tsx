"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Game } from '@/types/game';
import { simulateWeek } from '@/logic/simulation';

export default function GameDashboard() {
    const { gameId } = useParams();
    const [gameData, setGameData] = useState<Game | null>(null);

    useEffect(() => {
        async function fetchData() {
            const data = await loadGameData(Number(gameId));
            setGameData(data);
        }
        fetchData();
    }, [gameId]);

    const handleSimulateWeek = async () => {
        if (gameData) {
            await simulateWeek(gameData.gameId);
            const updatedGame = await loadGameData(gameData.gameId); // Reload to get updated state
            setGameData(updatedGame ?? null);
        }
    };

    if (!gameData) return <div>Loading...</div>;

    return (
        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-md transition-colors">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Game Dashboard</h1>
            
            <button onClick={handleSimulateWeek} className="px-4 py-2 bg-accent font-semibold text-white rounded">
                Simulate Next Week
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Team</h2>
                    {/* <p>{gameData.currentTeam}</p> */ }
                    <p>{gameData.teams[0].college}</p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Week</h2>
                    <p>{gameData.currentWeek} </p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Game Phase</h2>
                    <p>{gameData.gamePhase}</p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Year</h2>
                    <p>{gameData.currentYear} </p>
                </div>
            </div>
        </div>
    );
}