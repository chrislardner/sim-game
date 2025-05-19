"use client";

import { use, useEffect, useState } from "react";
import { loadGameData, loadMeets, loadTeams } from "@/data/storage";
import { Meet } from "@/types/schedule";
import { Team } from "@/types/team";
import Table from "@/components/Table";
import YearFilter from "@/components/YearFilterer"; 
import { Game } from "@/types/game";

type TransformedMeet = Omit<Meet, "teams" | "season"> & {
    teams: string;
    season: 'TF' | 'XC';
};

export default function TeamSchedulePage({ params }: Readonly<{ params: Promise<{ gameId: string; teamId: string }> }>) {
    const { gameId, teamId } = use(params);
    const [team, setTeam] = useState<Team>();
    const [meets, setMeets] = useState<Meet[]>([]);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
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
            setMeets(teamMeets);

            // Create a mapping of teamId to team college
            const teamsMapping = teamData.reduce((accumulated: { [key: number]: Team }, team) => {
                accumulated[team.teamId] = team;
                return accumulated;
            }, {});
            setTeamsMap(teamsMapping);

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
    ];

    const data: TransformedMeet[] = filteredMeets.map(meet => ({
        ...meet,
        teams: meet.teams.map(team => teamsMap[team.teamId]?.abbr).join(", "),
        season: meet.season === 'track_field' ? 'TF' : 'XC',

    }));

    const getRowLink = (meet: TransformedMeet) => `/games/${gameId}/schedule/${meet.meetId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Team Schedule</h1>
            <h2 className="text-2xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{team?.college + ' (' + team?.abbr + ')'}</h2>

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
