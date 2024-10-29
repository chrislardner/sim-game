'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadGameData } from '@/data/storage';
import { simulateWeek } from '@/logic/simulation';
import { Game } from '@/types/game';

export default function GamePage() {
    const { gameId } = useParams(); // Correctly accessing dynamic route parameter
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        const fetchGame = async () => {
            if (gameId) {
                const loadedGame = await loadGameData(Number(gameId));
                setGame(loadedGame ?? null);
            }
        };
        fetchGame();
    }, [gameId]);

    const handleSimulateWeek = async () => {
        if (game) {
            await simulateWeek(game.gameId);
            const updatedGame = await loadGameData(game.gameId); // Reload to get updated state
            setGame(updatedGame ?? null);
        }
    };

    if (!game) return <p>Loading game data...</p>;

    return (
        <div>
            <h1>Game {game.gameId} - {game.currentYear}</h1>
            <p>Current Week: {game.currentWeek}</p>
            <button onClick={handleSimulateWeek} className="px-4 py-2 bg-green-500 text-white rounded">
                Simulate Next Week
            </button>
        </div>
    );
}
