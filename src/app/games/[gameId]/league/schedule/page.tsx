"use client";

import {use, useEffect, useState} from 'react';
import {loadGameData, loadMeets, loadTeams} from '@/data/storage';
import {Meet} from '@/types/schedule';
import {Team} from '@/types/team';
import {Game} from '@/types/game';
import Table from '@/components/LegacyTable';
import YearFilter from '@/components/YearFilterer';

type TransformedMeet = Omit<Meet, 'teams' | 'season'> & {
    teams: string;
    season: string;
    winner: string;
    points: number;
};

export default function LeagueSchedulePage({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const {gameId} = use(params);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [meets, setMeets] = useState<Meet[]>([]);
    const [currentYear, setCurrentYear] = useState<number>(2024);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData: Game = await loadGameData(Number(gameId));
            const teamsData: Team[] = await loadTeams(Number(gameId));
            const meetsData: Meet[] = await loadMeets(Number(gameId));
            const years = Array.from(new Set(meetsData.map(meet => meet.year)));
            setAvailableYears(years);
            setCurrentYear(gameData.currentYear);
            setSelectedYear(gameData.currentYear);
            setMeets(meetsData);
            const teamsMapping = teamsData.reduce((accumulated: { [key: number]: Team }, team: Team) => {
                accumulated[team.teamId] = team;
                return accumulated;
            }, {});
            setTeamsMap(teamsMapping);

        }

        fetchData().catch(console.error);
    }, [gameId]);

    if (!meets) return <div>Loading...</div>;

    const filteredMeets = selectedYear === 'all' ? meets : meets.filter(meet => meet.year === selectedYear);

    const columns: { key: keyof TransformedMeet; label: string }[] = [
        {key: 'week', label: 'Week'},
        {key: 'type', label: 'Type'},
        {key: 'season', label: 'Season'},
        {key: 'teams', label: 'Teams'},
        {key: 'winner', label: "Winner"},
        {key: 'points', label: "Points"}
    ];

    const data = filteredMeets.map(meet => {
        return {
            ...meet,
            teams: meet.teams.map(team => teamsMap[team.teamId]?.abbr + " (" + (meet.season === 'cross_country' ? teamsMap[team.teamId]?.xc_ovr : teamsMap[team.teamId]?.ovr) + ")").join(", "),
            season: meet.season === 'track_field' ? 'TF' : 'XC',
            winner: teamsMap[meet.teams.sort((a, b) =>
                meet.season === 'cross_country' ? a.points - b.points : b.points - a.points).at(0)?.teamId]?.abbr,
            points: meet.teams.sort((a, b) =>
                meet.season === 'cross_country' ? a.points - b.points : b.points - a.points).at(0)?.points,
        };
    });

    const getRowLink = (meet: TransformedMeet) => `/games/${gameId}/league/schedule/${meet.meetId}`;

    return (
        <div className="py-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">League Schedule</h1>
            <YearFilter
                availableYears={availableYears}
                currentYear={currentYear}
                selectedYear={selectedYear}
                onYearChangeAction={setSelectedYear}
            />

            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['week']}/>
        </div>
    );
}
