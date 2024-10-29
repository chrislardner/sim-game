// src/app/games/[gameId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { loadGameData } from '@/data/storage';
import { useEffect, useState } from 'react';
import { Game } from '@/types/game';


export default function GameDashboard() {
    const { gameId } = useParams();
    const [gameData, setGameData] = useState<Game>();

    useEffect(() => {
        async function fetchData() {
            const data = await loadGameData(Number(gameId));
            setGameData(data);
        }
        fetchData();
    }, [gameId]);

    if (!gameData) return <div>Loading...</div>;

    return (
        <div>
            <h1>Game Dashboard: {gameData.currentYear}</h1>
            <ul>
                <li>Current Week: {gameData.currentWeek}</li>
                <li>Game Phase: {gameData.gamePhase}</li>
            </ul>
            <nav>
                <a href={`/games/${gameId}/teams`}>Teams</a>
                <a href={`/games/${gameId}/players`}>Players</a>
                <a href={`/games/${gameId}/schedule`}>Schedule</a>
                <a href={`/games/${gameId}/playoffs`}>Playoffs</a>
            </nav>
        </div>
    );
}
