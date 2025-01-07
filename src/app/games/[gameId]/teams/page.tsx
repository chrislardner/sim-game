"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadTeams } from '@/data/storage';
import { Team } from '@/types/team';
import Link from 'next/link';

export default function TeamsPage() {
    const { gameId } = useParams();
    const [teams, setTeamsData] = useState<Team[]>();

    useEffect(() => {
        async function fetchData() {
            const teamsData = await loadTeams(Number(gameId));
            setTeamsData(teamsData);
        }
        fetchData();
    }, [gameId]);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Teams</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams && teams.map(team => (
                    <Link key={team.teamId} href={`/games/${gameId}/teams/${team.teamId}`}>
                        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                            <h2 className="text-xl font-bold mb-2 text-accent">{team.college}</h2>
                            <p className="text-gray-700 dark:text-gray-300">Team Name: <span className="font-semibold">{team.teamName}</span></p>
                            <p className="text-gray-700 dark:text-gray-300">ConferenceId: <span className="font-semibold">{team.conferenceId}</span></p>
                        </div>
                    </Link>
                ))}
        </div>
        </div >
    );
}
