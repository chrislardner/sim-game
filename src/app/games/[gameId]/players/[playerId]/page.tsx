"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadPlayerData } from '@/data/storage';
import { Player } from '@/types/player';

export default function PlayerPage() {
    const { gameId, playerId } = useParams();
    const [player, setPlayer] = useState<Player | null>(null);

    useEffect(() => {
        async function fetchPlayer() {
            if (playerId) {
                const id = parseInt(playerId as string, 10);
                const intgameId = parseInt(gameId as unknown as string, 10);
                if (!isNaN(id)) {
                    const playerData = await loadPlayerData(intgameId, id);
                    setPlayer(playerData || null);  
                } else {
                    console.error('Invalid playerId:', playerId);
                }
            }
        }

        fetchPlayer();
    }, [playerId]);

    if (!player) {
        return <div>Loading or player not found</div>;  // Handles both loading and missing player cases
    }

    return (
        <div>
            <h1>{player.firstName} {player.lastName}</h1>
            <p>Team ID: {player.teamId}</p>
            <p>Stats: {JSON.stringify(player.stats)}</p>
        </div>
    );
}
