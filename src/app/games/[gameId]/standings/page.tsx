"use client"

import { loadGameData, loadTeams } from '@/data/storage';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function StandingsPage({ params }: { params: Promise<{ gameId: string }> }) {
    const router = useRouter();
    const { gameId } = use(params);
    const [game, setGame] = useState<Game>();
    const [teams, setTeams] = useState<Team[]>();

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const gameData = await loadGameData(Number(gameId));
                setGame(gameData);
                const teamsData: Team[] = await loadTeams(Number(gameId));
                setTeams(teamsData);
            }
            fetchData();
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    if (!game) {
        return <div>Loading...</div>;
    }

    const handleTeamClick = (teamId: number) => {
        router.push(`/games/${gameId}/teams/${teamId}`);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Standings</h1>
            <ul>
                {teams?.map((team: Team) => (
                    <li key={team.teamId} onClick={() => handleTeamClick(team.teamId)} className="cursor-pointer">
                        Team {team.teamId} - Points: {team.points}
                    </li>
                ))}
            </ul>
        </div>
    );
}
