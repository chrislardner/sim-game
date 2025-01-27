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

    const columns: { key: keyof Team | 'conference' | 'ovr_rank' | 'longDistance_rank' | 'middleDistance_rank' | 'shortDistance_rank' | 'xc_rank'; label: string }[] = [
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
        { key: 'ovr_rank', label: 'Overall Rank' },
        { key: 'shortDistance_rank', label: 'Short Distance Rank' },
        { key: 'middleDistance_rank', label: 'Middle Distance Rank' },
        { key: 'longDistance_rank', label: 'Long Distance Rank' },
        { key: 'xc_ovr', label: 'XC Overall' },
        { key: 'xc_rank', label: 'XC Rank' },
    ];

    const rankTeams = (teams: Team[], key: keyof Team) => {
        return teams
            .slice()
            .sort((a, b) => Number(b[key]) - Number(a[key]))
            .reduce((acc, team, index) => {
                acc[team.teamId] = index + 1;
                return acc;
            }, {} as Record<number, number>);
    };

    const ovrRanks = rankTeams(teams, 'ovr');
    const shortDistanceRanks = rankTeams(teams, 'sprint_ovr');
    const middleDistanceRanks = rankTeams(teams, 'middle_ovr');
    const longDistanceRanks = rankTeams(teams, 'long_ovr');
    const xcRanks = rankTeams(teams, 'xc_ovr');

    const data = teams.map(team => ({
        ...team,
        conference: game?.conferenceIdMap[team.conferenceId] || '',
        ovr_rank: ovrRanks[team.teamId],
        shortDistance_rank: shortDistanceRanks[team.teamId],
        middleDistance_rank: middleDistanceRanks[team.teamId],
        longDistance_rank: longDistanceRanks[team.teamId],
        xc_ovr: team.xc_ovr,
        xc_rank: xcRanks[team.teamId],
    }));

    const getRowLink = (team: Team) => `/games/${gameId}/teams/${team.teamId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Teams</h1>
            {game && <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['college']} />}
        </div>
    );
}
