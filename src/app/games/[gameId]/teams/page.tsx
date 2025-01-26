"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { loadTeams, loadGameData } from '@/data/storage';
import { Team } from '@/types/team';
import Table from '@/components/Table'; // Adjust the import path as necessary
import { Game } from '@/types/game';

export default function TeamsPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const [teams, setTeams] = useState<Team[]>([]);
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const teamsData = await loadTeams(Number(gameId));
                setTeams(teamsData);
                const gameData = await loadGameData(Number(gameId));
                setGame(gameData);
            }
            fetchData();
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    const columns: { key: keyof Team | 'conference'; label: string }[] = [
        { key: 'college', label: 'College' },
        { key: 'teamName', label: 'Team Name' },
        { key: 'conference', label: 'Conference' },
        { key: 'ovr', label: 'Overall' },
        { key: 'points', label: 'Points' },
        { key: 'state', label: 'State' },
        { key: 'city', label: 'City' },
        { key: 'sprint_ovr', label: 'Sprint Overall' },
        { key: 'middle_ovr', label: 'Middle Overall' },
        { key: 'long_ovr', label: 'Long Overall' },
    ];

    const data = teams.map(team => ({
        ...team,
        conference: game?.conferenceIdMap[team.conferenceId] || ''
    }));

    const getRowLink = (team: Team) => `/games/${gameId}/teams/${team.teamId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Teams</h1>
            {game && <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['college']} />}
        </div>
    );
}
