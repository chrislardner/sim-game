'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Team } from '@/types/team';

export default function TeamsPage() {
    const { gameId } = useParams();
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            const game = await loadGameData(Number(gameId));
            if (game) setTeams(game.teams);
        };
        fetchTeams();
    }, [gameId]);

    return (
        <div>
            <h1>Teams</h1>
            <ul>
                {teams.map((team) => (
                    <li key={team.teamId}>
                        <a href={`/games/${gameId}/teams/${team.teamId}`}>
                            Team {team.teamId} - {team.conference}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
