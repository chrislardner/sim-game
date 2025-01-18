// src/app/games/[gameId]/players/[playerId]/page.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { loadPlayers } from '@/data/storage';
import { Player } from '@/types/player';
import { display } from 'facesjs';
import { use } from 'react';

export default function PlayerPage({ params }: { params: Promise<{ gameId: string, playerId: string }> }) {
    const { gameId, playerId } = use(params);
    const [player, setPlayer] = useState<Player>();
    const faceContainerRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            if (gameId && playerId) {
                const playerData = await loadPlayers(Number(gameId));
                const selectedPlayer = playerData.find(p => p.playerId === Number(playerId));
                setPlayer(selectedPlayer);

                if (faceContainerRef.current && selectedPlayer?.face) {
                    display(faceContainerRef.current, selectedPlayer.face);
                }
            }
        }
        fetchData();
    }, [gameId, playerId, player?.face]);

    if (!player) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{player.firstName} {player.lastName}</h1>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Player Details</h2>
                <p className="text-gray-700 dark:text-gray-300">Year: <span className="font-semibold">{player.year}</span></p>
                <p className="text-gray-700 dark:text-gray-300">Event Type: <span className="font-semibold">{Object.entries(player.eventTypes).map(([key, value]) => `${key}: ${value.join(', ')}`).join('; ')}</span></p>
                {/* <div ref={faceContainerRef} className="w-48 h-48"></div> */}
            </div>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Player Personality</h2>
                <ul className="text-gray-700 dark:text-gray-300">
                    {/* <li>Leadership: {player.personality?.leadership}</li>
                    <li>Loyalty: {player.personality?.loyalty}</li>
                    <li>Work Ethic: {player.personality?.workEthic}</li> */}
                    {/* Additional personality attributes */}
                </ul>
            </div>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Player Stats</h2>
                <ul className="text-gray-700 dark:text-gray-300">
                    <li>Overall: {player.playerRatings?.overall}</li>
                    <li>Potential: {player.playerRatings?.potential}</li>
                    <li>Stength: {player.playerRatings?.strength}</li>
                    <li>Injury Resistance: {player.playerRatings?.injuryResistance}</li>
                    <li>Consistency: {player.playerRatings?.consistency}</li>
                    <li>Athleticism: {player.playerRatings?.athleticism}</li>
                    <li>Long Distance: {player.playerRatings?.longDistance}</li>
                    <li>Pacing: {player.playerRatings?.pacing}</li>
                    <li>Middle Distance: {player.playerRatings?.middleDistance}</li>
                    <li>Sprinting: {player.playerRatings?.sprinting}</li>
                    <li>Acceleration: {player.playerRatings?.acceleration}</li>
                    <li>Explosiveness: {player.playerRatings?.explosiveness}</li>

                </ul>
            </div>
        </div>
    );
}
