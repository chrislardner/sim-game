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
    season: 'TF' | 'XC';
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
            setSelectedYear(gameData.currentYear); // Set the selected year to the current game year
            setMeets(meetsData);
            // Create a mapping of teamId to team college
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
    ];

    const data: TransformedMeet[] = filteredMeets.map(meet => ({
        ...meet,
        teams: meet.teams.map(team => teamsMap[team.teamId]?.abbr).join(', '),
        season: meet.season === 'track_field' ? 'TF' : 'XC',
    }));

    const getRowLink = (meet: TransformedMeet) => `/games/${gameId}/league/schedule/${meet.meetId}`;

    return (
        <div className="p-4">
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
