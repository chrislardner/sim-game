'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Player } from '@/types/player';

export default function PlayersPage() {
    const { gameId } = useParams();
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            const game = await loadGameData(Number(gameId));
            const allPlayers = game?.teams.flatMap((team) => team.players) || [];
            setPlayers(allPlayers);
        };
        fetchPlayers();
    }, [gameId]);

    return (
        <div>
            <h1>Players</h1>
            <ul>
                {players.map((player) => (
                    <li key={player.playerId}>
                        <a href={`/games/${gameId}/players/${player.playerId}`}>{player.firstName} {player.lastName}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
