"use client";

import { use, useEffect, useState } from "react";
import { loadGameData, loadMeets, loadRaces, loadTeams } from "@/data/storage";
import { Meet, Race } from "@/types/schedule";
import { Team } from "@/types/team";
import Table from "@/components/Table";
import YearFilter from "@/components/YearFilterer"; // Import the reusable component
import { Game } from "@/types/game";

type TransformedMeet = Omit<Meet, "teams" | "races"> & {
    teams: string;
    races: string;
};

export default function TeamSchedulePage({ params }: { params: Promise<{ gameId: string; teamId: string }> }) {
    const { gameId, teamId } = use(params);
    const [team, setTeam] = useState<Team>();
    const [meets, setTeamMeets] = useState<Meet[]>([]);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [raceMap, setRaceMap] = useState<{ [key: number]: Race }>({});
    const [currentYear, setCurrentYear] = useState<number>(2024);
    const [selectedYear, setSelectedYear] = useState<number | "all">(currentYear);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    useEffect(() => {
        async function fetchData() {
            const teamData = await loadTeams(Number(gameId));
            const selectedTeam = teamData.find(t => t.teamId === Number(teamId));
            setTeam(selectedTeam);

            const gameData: Game = await loadGameData(Number(gameId));

            const meetData: Meet[] = await loadMeets(Number(gameId));
            const teamMeets: Meet[] = meetData.filter((m: Meet) => m.teams.some(team => team.teamId === Number(teamId)));
            setTeamMeets(teamMeets);

            const raceData: Race[] = await loadRaces(Number(gameId));

            // Create a mapping of teamId to team college
            const teamsMapping = teamData.reduce((accumlated: { [key: number]: Team }, team) => {
                accumlated[team.teamId] = team;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);

            // Create a mapping of raceId to race
            const racesMapping: { [key: number]: Race } = {};
            raceData.forEach(r => (racesMapping[r.raceId] = r));
            setRaceMap(racesMapping);

            const years = Array.from(new Set(teamMeets.map(meet => meet.year)));
            setAvailableYears(years);
            setCurrentYear(gameData.currentYear);
            setSelectedYear(gameData.currentYear); 
        }
        fetchData().catch(console.error);
    }, [gameId, teamId]);

    if (!meets) return <div>Loading...</div>;

    const filteredMeets = selectedYear === "all" ? meets : meets.filter(meet => meet.year === selectedYear);

    const columns: { key: keyof TransformedMeet; label: string }[] = [
        { key: "week", label: "Week" },
        { key: "type", label: "Type" },
        { key: "season", label: "Season" },
        { key: "year", label: "Year" },
        { key: "teams", label: "Teams" },
        { key: "races", label: "Races" },
    ];

    const data: TransformedMeet[] = filteredMeets.map(meet => ({
        ...meet,
        teams: meet.teams.map(team => teamsMap[team.teamId]?.college).join(", "),
        races: meet.races.map(raceId => raceMap[raceId]?.eventType).join(", "),
    }));

    const getRowLink = (meet: TransformedMeet) => `/games/${gameId}/schedule/${meet.meetId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Team Schedule</h1>
            <h2 className="text-2xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{team?.college}</h2>

            {/* YearFilter Component */}
            <YearFilter
                availableYears={availableYears}
                currentYear={currentYear}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={["week"]} />
        </div>
    );
}
