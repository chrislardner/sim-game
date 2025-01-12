"use client";

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { loadTeams } from '@/data/storage';
import { Team } from '@/types/team';

export default function TeamsPage({ params }: { params: Promise<{ gameId: string }> }) {
    const router = useRouter();
    const { gameId } = use(params);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const teamsData = await loadTeams(Number(gameId));
                setTeams(teamsData);
            }
            fetchData();
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    const handleTeamClick = (teamId: number) => {
        router.push(`/games/${gameId}/teams/${teamId}`);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Teams</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                    <div
                        key={team.teamId}
                        className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors cursor-pointer"
                        onClick={() => handleTeamClick(team.teamId)}
                    >
                        <h2 className="text-xl font-bold mb-2 text-accent">{team.college}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Team Name: <span className="font-semibold">{team.teamName}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">ConferenceId: <span className="font-semibold">{team.conferenceId}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
}
