"use client";

import { use, useEffect, useRef, useState } from 'react';
import { loadPlayers } from '@/data/storage';
import { Player } from '@/types/player';
import { display } from 'facesjs';
import PlayerResults from '@/components/PlayerResults';
import PlayerRatingsTable from '@/components/PlayerRatingsTable';

export default function PlayerPage({ params }: Readonly<{ params: Promise<{ gameId: string, playerId: string }> }>) {
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
                <p className="text-gray-700 dark:text-gray-300">Event Types: <span className="font-semibold">{Object.values(player.eventTypes).flat().join(', ')}</span></p>
                <p className="text-gray-700 dark:text-gray-300">Seasons <span className="font-semibold">{player.seasons.join(', ')}</span></p>
                <p className="text-gray-700 dark:text-gray-300">Archetype: <span className="font-semibold">{player.playerSubArchetype.main.join(', ')}</span></p>
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
                {player.playerRatings && <PlayerRatingsTable playerRatings={player.playerRatings} />}
            </div>
            <PlayerResults gameId={Number(gameId)} playerId={Number(playerId)} />
        </div>
    );
}