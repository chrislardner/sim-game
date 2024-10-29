"use client"

import { loadGameData } from '@/data/storage';

interface Params {
    gameId: string;
}

export default async function StandingsPage({ params }: { params: Params }) {
    const game = await loadGameData(Number(params.gameId));
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Standings</h1>
            <ul>
                {game.teams.map(team => (
                    <li key={team.teamId}>
                        Team {team.teamId} - Points: {team.points}
                    </li>
                ))}
            </ul>
        </div>
    );
}
