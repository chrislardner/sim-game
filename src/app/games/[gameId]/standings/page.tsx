"use client";

import { loadGameData, loadTeams, loadMeets } from '@/data/storage';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { Meet } from '@/types/schedule';
import { useEffect, useState } from 'react';
import Table from '@/components/Table';

export default function StandingsPage({ params }: { params: { gameId: string } }) {
    const { gameId } = params;
    const [game, setGame] = useState<Game | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [meets, setMeets] = useState<Meet[]>([]);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                try {
                    const gameData = await loadGameData(Number(gameId));
                    setGame(gameData);
                    const teamsData = await loadTeams(Number(gameId));
                    setTeams(teamsData);
                    const meetsData = await loadMeets(Number(gameId));
                    setMeets(meetsData);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                }
            }
            fetchData();
        } else {
            console.log("Couldn't find gameId", gameId);
        }
    }, [gameId]);

    if (!game) {
        return <div>Loading...</div>;
    }

    const columns: { key: keyof Meet | 'teamName'; label: string }[] = [
        { key: 'date', label: 'Date' },
        { key: 'week', label: 'Week' },
        { key: 'type', label: 'Type' },
        { key: 'season', label: 'Season' },
        { key: 'teamName', label: 'Team Name' },
    ];

    const data = meets.flatMap(meet => 
        meet.teams.map(team => ({
            ...meet,
            teamName: teams.find(t => t.teamId === team.teamId)?.teamName || 'Unknown',
        }))
    );

    const getRowLink = (item: Meet) => `/games/${gameId}/meets/${item.meetId}`;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Schedule</h1>
            {meets.length > 0 ? (
                <Table
                    data={data}
                    columns={columns}
                    getRowLink={getRowLink}
                    linkColumns={['teamName']}
                />
            ) : (
                <div>No meets available</div>
            )}
        </div>
    );
}
