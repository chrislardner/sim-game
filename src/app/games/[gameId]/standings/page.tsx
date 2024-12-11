"use client"

import { loadGameData } from '@/data/storage';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StandingsPage() {
    const { gameId } = useParams();
    const [game, setGame] = useState<Game>();

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            setGame(gameData);
        }
        fetchData();
    }, [gameId]);

    if (!game) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Standings</h1>
            <ul>
                {game.teams.map((team: Team) => (
                    <li key={team.teamId}>
                        Team {team.teamId} - Points: {team.points}
                    </li>
                ))}
            </ul>
        </div>
    );
}
