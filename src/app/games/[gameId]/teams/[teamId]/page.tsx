"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGameData } from '@/data/storage';
import { Team } from '@/types/team';
import { Player } from '@/types/player';

export default function TeamPage() {
    const { gameId, teamId } = useParams();
    const [team, setTeam] = useState<Team | null>(null);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const selectedTeam = gameData?.teams.find(t => t.teamId === Number(teamId));
            setTeam(selectedTeam || null);
        }
        fetchData();
    }, [gameId, teamId]);

    if (!team) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{team.teamName}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">College: <span className="font-semibold">{team.college}</span></p>

            <Link href={`/games/${gameId}/teams/${teamId}/schedule`}>
                <button className="px-4 py-2 bg-accent text-white rounded-lg transition hover:bg-accent-dark mb-6">
                    View Team Schedule
                </button>
            </Link>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.players.map(player => (
                    <Link key={player.playerId} href={`/games/${gameId}/players/${player.playerId}`}>
                        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors cursor-pointer hover:shadow-xl">
                            <h3 className="text-xl font-semibold text-accent">{player.firstName} {player.lastName}</h3>
                            <p className="text-gray-700 dark:text-gray-300">Year: <span className="font-semibold">{player.year}</span></p>
                            <p className="text-gray-700 dark:text-gray-300">Season(s): <span className="font-semibold">{player.seasons.join(', ')}</span></p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
