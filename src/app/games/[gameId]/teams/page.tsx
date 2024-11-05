"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Team } from '@/types/team';

export default function TeamsPage() {
    const { gameId } = useParams();
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            setTeams(gameData?.teams || []);
        }
        fetchData();
    }, [gameId]);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6">Teams</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map(team => (
                    <div key={team.teamId} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-md transition-colors">
                        <h2 className="text-xl font-bold mb-2">
                            <a href={`/games/${gameId}/teams/${team.teamId}`}>{team.teamName}</a>
                        </h2>
                        <p>College: <span className="font-semibold">{team.college}</span></p>
                        <p>Conference: <span className="font-semibold">{team.conference}</span></p>
                        <p>Region: <span className="font-semibold">{team.region}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
}
