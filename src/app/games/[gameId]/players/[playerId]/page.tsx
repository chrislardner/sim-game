"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Player } from '@/types/player';

export default function PlayerPage() {
    const { gameId, playerId } = useParams();
    const [player, setPlayer] = useState<Player | null>(null);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const selectedPlayer = gameData?.teams.flatMap(team => team.players).find(p => p.playerId === Number(playerId));
            setPlayer(selectedPlayer || null);
        }
        fetchData();
    }, [gameId, playerId]);

    if (!player) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{player.firstName} {player.lastName}</h1>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Player Details</h2>
                <p className="text-gray-700 dark:text-gray-300">Year: <span className="font-semibold">{player.year}</span></p>
                <p className="text-gray-700 dark:text-gray-300">Event Type: <span className="font-semibold">{player.eventType}</span></p>
            </div>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Player Personality</h2>
                <ul className="text-gray-700 dark:text-gray-300">
                    <li>Leadership: {player.personality?.leadership}</li>
                    <li>Loyalty: {player.personality?.loyalty}</li>
                    <li>Work Ethic: {player.personality?.workEthic}</li>
                    {/* Additional personality attributes */}
                </ul>
            </div>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Player Stats</h2>
                <ul className="text-gray-700 dark:text-gray-300">
                    <li>Strength: {player.stats?.strength}</li>
                    <li>Speed: {player.stats?.speed}</li>
                    <li>Endurance: {player.stats?.endurance}</li>
                    {/* Additional stats */}
                </ul>
            </div>
        </div>
    );
}
