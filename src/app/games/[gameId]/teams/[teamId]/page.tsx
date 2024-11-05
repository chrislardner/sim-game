"use client";

import { useParams } from 'next/navigation';
import { loadGameData } from '@/data/storage';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { Meet } from '@/types/schedule';
import { useEffect, useState } from 'react';

export default function TeamDashboard() {
    const { gameId, teamId } = useParams();
    const [teamData, setTeamData] = useState<Team>();

    useEffect(() => {
        async function fetchData() {
            const data: Game = await loadGameData(Number(gameId));
            const team = data.teams.find(t => t.teamId === Number(teamId));
            setTeamData(team);
        }
        fetchData();
    }, [gameId, teamId]);

    if (!teamData) return <div>Loading...</div>;

    return (
        <div>
            <h1>Team Dashboard</h1>
            <h2>Conference: {teamData.conference}</h2>
            <h2>Points: {teamData.points}</h2>

            <section>
                <h3>Roster</h3>
                <ul>
                    {teamData.players.map(player => (
                        <li key={player.playerId}>
                            <a href={`/games/${gameId}/players/${player.playerId}`}>
                                Player ID: {player.playerId}, Year: {player.year}
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3>Schedule</h3>
 
            </section>
        </div>
    );
}
