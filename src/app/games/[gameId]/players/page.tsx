"use client";

import {use, useEffect, useState} from 'react';
import {loadActivePlayers, loadTeams} from '@/data/storage';
import {Player} from '@/types/player';
import Table from '@/components/Table';
import {Team} from '@/types/team';

export default function PlayersPage({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const {gameId} = use(params);
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const [playersData, teamsData] = await Promise.all([
                    loadActivePlayers(Number(gameId)),
                    loadTeams(Number(gameId))
                ]);
                setPlayers(playersData);
                setTeams(teamsData);
            }

            fetchData().catch(console.error);
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    const columns: {
        key: "fullName" | 'team' | "year" | "seasons" | "overall" | "potential" | "shortDistanceOvr" | "middleDistanceOvr" | "longDistanceOvr",
        label: string
    }[] = [
        {key: 'fullName', label: 'Full Name'},
        {key: 'team', label: 'College'},
        {key: 'year', label: 'Year'},
        {key: 'seasons', label: 'Seasons'},
        {key: 'overall', label: 'Overall'},
        {key: 'potential', label: 'Potential'},
        {key: 'shortDistanceOvr', label: 'Short Distance Ovr'},
        {key: 'middleDistanceOvr', label: 'Mid Distance Ovr'},
        {key: 'longDistanceOvr', label: 'Long Distance Ovr'},
    ];

    const teamMap = teams.reduce((map, team) => {
        map[team.teamId] = team.abbr;
        return map;
    }, {} as Record<number, string>);

    const data = players.map(player => ({
        ...player,
        team: teamMap[player.teamId] || 'Unknown',
        fullName: `${player.firstName} ${player.lastName}`,
        seasons: player.seasons.map(season => season === 'track_field' ? 'TF' : 'XC').join(', ') as unknown as ("track_field" | "cross_country")[],
        ...player.playerRatings,
        ...player.playerRatings.typeRatings,
    }));

    const getRowLink = (player: Player) => `/games/${gameId}/players/${player.playerId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Players</h1>
            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['fullName']}/>
        </div>
    );
}
