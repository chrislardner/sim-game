"use client";

import { use, useEffect, useState } from 'react';
import { loadTeams, loadMeets, loadRaces, loadGameData } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import Table from '@/components/Table'; // Adjust the import path as necessary
import YearFilter from '@/components/YearFilterer'; // Import the reusable component

type TransformedMeet = Omit<Meet, 'teams' | 'races'> & {
    teams: string;
    races: string;
};

export default function LeagueSchedulePage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [meets, setMeets] = useState<Meet[]>([]);
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>({});
    const [currentYear, setCurrentYear] = useState<number>(2024);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData: Game = await loadGameData(Number(gameId));
            const teamsData: Team[] = await loadTeams(Number(gameId));
            const meetsData: Meet[] = await loadMeets(Number(gameId));
            const racesData: Race[] = await loadRaces(Number(gameId));
            const years = Array.from(new Set(meetsData.map(meet => meet.year)));
            setAvailableYears(years);
            setCurrentYear(gameData.currentYear);
            setSelectedYear(gameData.currentYear); // Set the selected year to the current game year
            setMeets(meetsData);
            // Create a mapping of teamId to team college
            const teamsMapping = teamsData.reduce((accumlated: { [key: number]: Team }, team: Team) => {
                accumlated[team.teamId] = team;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);
            const racesMapping = racesData.reduce((accumlated: { [key: number]: Race }, race: Race) => {
                accumlated[race.raceId] = race;
                return accumlated;
            }, {});
            setRacesMap(racesMapping);

        }
        fetchData().catch(console.error);
    }, [gameId]);

    if (!meets) return <div>Loading...</div>;

    const filteredMeets = selectedYear === 'all' ? meets : meets.filter(meet => meet.year === selectedYear);

    const columns: { key: keyof TransformedMeet; label: string }[] = [
        { key: 'week', label: 'Week' },
        { key: 'type', label: 'Type' },
        { key: 'season', label: 'Season' },
        { key: 'teams', label: 'Teams' },
        { key: 'races', label: 'Races' },
    ];

    const data: TransformedMeet[] = filteredMeets.map(meet => ({
        ...meet,
        teams: meet.teams.map(team => teamsMap[team.teamId]?.college).join(', '),
        races: meet.races.map(raceId => racesMap[raceId]?.eventType).join(', '),
    }));

    const getRowLink = (meet: TransformedMeet) => `/games/${gameId}/schedule/${meet.meetId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">League Schedule</h1>
            <YearFilter
                availableYears={availableYears}
                currentYear={currentYear}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['week']} />
        </div>
    );
}
