'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Team } from '@/types/team';

export default function SchedulePage() {
    const { gameId } = useParams();
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            const game = await loadGameData(Number(gameId));
            setTeams(game?.teams || []);
        };
        fetchSchedule();
    }, [gameId]);

    return (
        <div>
            <h1>Schedule and Standings</h1>
            <ul>
                {teams.map((team) => (
                    <li key={team.teamId}>
                        Team {team.teamId}: {team.points} Points
                    </li>
                ))}
            </ul>
        </div>
    );
}
