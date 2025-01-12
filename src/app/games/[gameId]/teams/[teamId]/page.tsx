"use client";

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { loadPlayers, loadTeams } from '@/data/storage';
import { Team } from '@/types/team';
import { Player } from '@/types/player';

export default function TeamPage({ params }: { params: Promise<{ gameId: string, teamId: string }> }) {
    const router = useRouter();
    const { gameId, teamId } = use(params);
    const [team, setTeam] = useState<Team>();
    const [players, setTeamPlayers] = useState<Player[]>();

    useEffect(() => {
        async function fetchData() {
            const teamData = await loadTeams(Number(gameId));
            const selectedTeam = teamData?.find(t => t.teamId === Number(teamId));
            setTeam(selectedTeam);
            const playerData = await loadPlayers(Number(gameId));
            const teamPlayers = playerData?.filter((p: Player) => p.teamId === Number(teamId));
            setTeamPlayers(teamPlayers);
        }
        fetchData();
    }, [gameId, teamId]);

    if (!team) return <div>Loading...</div>;

    const handlePlayerClick = (playerId: number) => {
        router.push(`/games/${gameId}/players/${playerId}`);
    };

    const handleScheduleClick = () => {
        router.push(`/games/${gameId}/teams/${teamId}/schedule`);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{team.college}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">College: <span className="font-semibold">{team.teamName}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Conference: <span className="font-semibold">{team.conferenceId}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Location: <span className="font-semibold">{team.city}, {team.state}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">TeamId: <span className="font-semibold">{team.teamId}</span></p>
            <button onClick={handleScheduleClick} className="px-4 py-2 bg-accent-dark text-white rounded-lg transition hover:bg-accent-light mb-6">
                View Team Schedule
            </button>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players && players.map((player: Player) => (
                    <div
                        key={player.playerId}
                        className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors cursor-pointer hover:shadow-xl"
                        onClick={() => handlePlayerClick(player.playerId)}
                    >
                        <h3 className="text-xl font-semibold text-accent">{player.firstName} {player.lastName}</h3>
                        <p className="text-gray-700 dark:text-gray-300">Year: <span className="font-semibold">{player.year}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Season(s): <span className="font-semibold">{player.seasons.join(', ')}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
}
