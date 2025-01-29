"use client";

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { loadGameData, loadPlayers, loadTeams } from '@/data/storage';
import { Team } from '@/types/team';
import { Player } from '@/types/player';
import Table from '@/components/Table'; // Adjust the import path as necessary
import { Conference } from '@/types/regionals';

export default function TeamPage({ params }: { params: Promise<{ gameId: string, teamId: string }> }) {
    const router = useRouter();
    const { gameId, teamId } = use(params);
    const [team, setTeam] = useState<Team>();
    const [players, setTeamPlayers] = useState<Player[]>([]);
    const [conference, setConference] = useState<Conference>();
    
    useEffect(() => {
        async function fetchData() {
            const teamData = await loadTeams(Number(gameId));
            const selectedTeam = teamData?.find(t => t.teamId === Number(teamId));
            setTeam(selectedTeam);
            const playerData = await loadPlayers(Number(gameId));
            const teamPlayers = playerData?.filter((p: Player) => p.teamId === Number(teamId));
            setTeamPlayers(teamPlayers);
            const gameData = await loadGameData(Number(gameId));
            const conferenceData = gameData?.conferences.find((conf: Conference) => conf.conferenceId === selectedTeam?.conferenceId);
            setConference(conferenceData);
        }
        fetchData();
    }, [gameId, teamId]);

    if (!team) return <div>Loading...</div>;

    const handleScheduleClick = () => {
        router.push(`/games/${gameId}/teams/${teamId}/schedule`);
    };

    const handlePrintTeamInfo = () => {
        console.log(team);
    };

    const columns: { key: "fullName" | "year" | "seasons" | "overall" | "potential" | "shortDistanceOvr" | "middleDistanceOvr" | "longDistanceOvr", label: string }[] = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'year', label: 'Year' },
        { key: 'seasons', label: 'Seasons' },
        { key: 'overall', label: 'Overall' },
        { key: 'potential', label: 'Potential' },
        { key: 'shortDistanceOvr', label: 'Short Distance Ovr' },
        { key: 'middleDistanceOvr', label: 'Middle Distance Ovr' },
        { key: 'longDistanceOvr', label: 'Long Distance Ovr' },
    ];

    const data = players.map(player => ({
        ...player,
        fullName: `${player.firstName} ${player.lastName}`,
        ...player.playerRatings,
        ...player.playerRatings.typeRatings,
    }));

    const getRowLink = (player: Player) => `/games/${gameId}/players/${player.playerId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{team.college}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">College: <span className="font-semibold">{team.teamName}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Conference: <span className="font-semibold">{conference?.conferenceName + ' ' + (conference?.conferenceAbbr)}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Location: <span className="font-semibold">{team.city}, {team.state}</span></p>
            <button onClick={handleScheduleClick} className="px-4 py-2 bg-accent-dark text-white rounded-lg transition hover:bg-accent-light mb-6">
                View Team Schedule
            </button>
            <button onClick={handlePrintTeamInfo} className="px-4 py-2 bg-accent-dark text-white rounded-lg transition hover:bg-accent-light mb-6 ml-4">
                Print Team Info
            </button>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Players</h2>
            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['fullName']} />
        </div>
    );
}
