"use client";

import {use, useEffect, useState} from 'react';
import {loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams} from '@/data/storage';
import {Meet, Race} from '@/types/schedule';
import {Player} from '@/types/player';
import {Team} from '@/types/team';
import Table from '@/components/LegacyTable';
import YearFilter from '@/components/YearFilterer';
import {Game} from '@/types/game';

type TransformedRace = {
    raceId: number;
    eventType: string;
    date: string;
    meetId: number;
    meetWeek: number;
    topWinner: string;
    topTeam: string;
    points: string;
    teams: string;
};

export default function RacesOverviewPage({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const {gameId} = use(params);
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

            const teamsMapping = teamData.reduce((accumulated: { [key: number]: Team }, team) => {
                accumulated[team.teamId] = team;
                return accumulated;
            }, {});
            setTeamsMap(teamsMapping);

            const playersMapping = playersData.reduce((accumulated: { [key: number]: Player }, player) => {
                accumulated[player.playerId] = player;
                return accumulated;
            }, {});
            setPlayersMap(playersMapping);

            const racesMapping: { [key: number]: Race } = {};
            raceData.forEach(r => {
                racesMapping[r.raceId] = r;
            });
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
            return `${player?.firstName} ${player?.lastName} (${team?.abbr}) - ${formatTime(topWinner.playerTime)}`;
        }
        return '';
    };

    const getTopTeam = (race: Race) => {
        const validTeams = race?.teams.filter(team => team.points > 0) || [];
        const sortedTeams = validTeams.toSorted((a, b) => {
            if (race?.eventType === '8000m') {
                return a.points - b.points; // Less points first for cross country
            } else {
                return b.points - a.points; // More points first for track
            }
        });
        const topTeam = sortedTeams[0];
        if (topTeam) {
            const team = teamsMap[topTeam.teamId];
            return `${team?.college + ' (' + team?.abbr + ')'} - ${topTeam.points} points`;
        }
        return 'N/A';
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
                eventType: race?.eventType || 'N/A',
                meetWeek: meet.week,
                topWinner: topWinner || 'N/A',
                topTeam: topTeam || 'N/A',
                points: teamsPoints,
                teams
            };
        })
    );

    const columns: { key: keyof TransformedRace; label: string; className: string }[] = [
        {key: 'eventType', label: 'Event Type', className: 'table-column-eventType'},
        {key: 'meetWeek', label: 'Week', className: 'table-column-meetWeek'},
        {key: 'date', label: 'Date', className: 'table-column-date'},
        {key: 'topWinner', label: 'Event Winner', className: 'table-column-topWinner'},
        {key: 'topTeam', label: 'Top Team', className: 'table-column-topTeam'},
    ];

    const getRowLink = (race: TransformedRace) => `/games/${gameId}/league/races/${race.raceId}`;

    return (
        <div className="py-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Races Overview</h1>

            <YearFilter
                availableYears={availableYears}
                currentYear={currentYear}
                selectedYear={selectedYear}
                onYearChangeAction={setSelectedYear}
            />

            {filteredMeets.map(meet => (
                <div key={meet.meetId} className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">{`Meet ${meet.meetId} - ${meet.date}`}</h2>
                    <Table data={data.filter(race => race.meetId === meet.meetId)} columns={columns}
                           getRowLink={getRowLink} linkColumns={['eventType']}/>
                </div>
            ))}
        </div>
    );
}
