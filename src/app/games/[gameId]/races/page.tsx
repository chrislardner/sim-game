"use client";

import { use, useEffect, useState } from 'react';
import { loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import { Player } from '@/types/player';
import { Team } from '@/types/team';
import Table from '@/components/Table'; // Adjust the import path as necessary
import YearFilter from '@/components/YearFilterer'; // Import the reusable component
import { Game } from '@/types/game';

type TransformedRace = {
    raceId: number;
    eventType: string;
    date: string;
    meetId: number;
    meetWeek: number;
    topWinner: string;
    topTeam: string;
    points: string; // Changed to string to display team points
    teams: string;
};

export default function RacesOverviewPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: Player }>({});
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>({});
    const [meets, setMeets] = useState<Meet[]>([]);
    const [currentYear, setCurrentYear] = useState<number>(2024);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
    const [availableYears, setAvailableYears] = useState<number[]>([]);


    useEffect(() => {
        if (!gameId) return;

        async function fetchData() {
            const gameData: Game = await loadGameData(Number(gameId));
            
            const teamData: Team[] = await loadTeams(Number(gameId));
            const playersData: Player[] = await loadPlayers(Number(gameId));
            const meetsData: Meet[] = await loadMeets(Number(gameId));
            const raceData: Race[] = await loadRaces(Number(gameId));

            const years = Array.from(new Set(meetsData.map(meet => meet.year)));
            setAvailableYears(years);
            setCurrentYear(gameData.currentYear);
            setSelectedYear(gameData.currentYear);

            setMeets(meetsData);

            const teamsMapping = teamData.reduce((accumlated: { [key: number]: Team }, team) => {
                accumlated[team.teamId] = team;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);

            const playersMapping = playersData.reduce((accumlated: { [key: number]: Player }, player) => {
                accumlated[player.playerId] = player;
                return accumlated;
            }, {});
            setPlayersMap(playersMapping);

            const racesMapping: { [key: number]: Race } = {};
            raceData.forEach(r => { racesMapping[r.raceId] = r; });
            setRacesMap(racesMapping);
        }
        fetchData();
    }, [gameId]);

    if (!racesMap) return <div>Loading...</div>;

    const filteredMeets = selectedYear === 'all' ? meets : meets.filter(meet => meet.year === selectedYear);

    const getTopWinner = (race: Race) => {
        const playerTimes = race?.participants.map(participant => ({
            playerId: participant.playerId,
            playerTime: participant.playerTime,
            points: participant.scoring.points
        }));
        playerTimes?.sort((a, b) => a.playerTime - b.playerTime);
        const topWinner = playerTimes?.[0];
        if (topWinner) {
            const player = playersMap?.[topWinner.playerId];
            const team = teamsMap?.[Object.values(teamsMap).find((team: Team) => team.players.some((pId: number) => pId === topWinner.playerId))?.teamId ?? -1];
            return `${player?.firstName} ${player?.lastName} (${team?.college}) - ${formatTime(topWinner.playerTime)}`;
        }
        return '';
    };

    const getTopTeam = (race: Race) => {
        const topTeam = race?.teams.reduce((prev, current) => (prev.points > current.points) ? prev : current);
        if (topTeam) {
            return `${teamsMap[topTeam.teamId]?.college} - ${topTeam.points} points`;
        }
        return '';
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    const data: TransformedRace[] = filteredMeets.flatMap(meet => 
        meet.races.map(raceId => {
            const race = racesMap[raceId];
            const topWinner = getTopWinner(race);
            const topTeam = getTopTeam(race);
            const teamsPoints = race?.teams.map(team => `${teamsMap[team.teamId]?.college}: ${team.points}`).join(', ') || '';
            const teams = race?.teams.map(team => teamsMap[team.teamId]?.college).join(', ') || '';
            return {
                raceId,
                date: meet.date,
                meetId: meet.meetId,
                eventType: race?.eventType || '',
                meetWeek: meet.week,
                topWinner: topWinner || '',
                topTeam: topTeam || '',
                points: teamsPoints,
                teams
            };
        })
    );

    const columns: { key: keyof TransformedRace; label: string }[] = [
        { key: 'eventType', label: 'Event Type' },
        { key: 'meetWeek', label: 'Week' },
        { key: 'date', label: 'Date' },
        { key: 'topWinner', label: 'Event Winner' },
        { key: 'topTeam', label: 'Top Team' },
    ];

    const getRowLink = (race: TransformedRace) => `/games/${gameId}/races/${race.raceId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Races Overview</h1>

            {/* YearFilter Component */}
            <YearFilter
                availableYears={availableYears}
                currentYear={currentYear}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            {filteredMeets.map(meet => (
                <div key={meet.meetId} className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">{`Meet ${meet.meetId} - ${meet.date}`}</h2>
                    <Table data={data.filter(race => race.meetId === meet.meetId)} columns={columns} getRowLink={getRowLink} linkColumns={['eventType']} />
                </div>
            ))}
        </div>
    );
}
