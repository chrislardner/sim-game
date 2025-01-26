"use client";

import { use, useEffect, useState } from 'react';
import { loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams } from '@/data/storage';
import { Game } from '@/types/game';
import { Meet, Race } from '@/types/schedule';
import { Player } from '@/types/player';
import { Team } from '@/types/team';
import Table from '@/components/Table'; // Adjust the import path as necessary

type TransformedRace = {
    raceId: number;
    eventType: string;
    meetId: number;
    date: string;
    topWinner: string;
    topTeam: string;
    points: string; // Changed to string to display team points
    teams: string;
};

export default function RacesOverviewPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const [gameData, setGameData] = useState<Game>();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: Player }>({});
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>({});
    const [meets, setMeets] = useState<Meet[]>([]);

    useEffect(() => {
        if (!gameId) return;

        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            setGameData(gameData);
            const teamData = await loadTeams(Number(gameId));
            const playersData = await loadPlayers(Number(gameId));
            const meetsData = await loadMeets(Number(gameId));
            const meetsThisYear = meetsData.filter(meet => meet.year === gameData.currentYear);
            setMeets(meetsThisYear);
            const raceData = await loadRaces(Number(gameId));
            const racesThisYear = raceData.filter(race => race.year === gameData.currentYear);

            // Create a mapping of teamId to team college
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
            racesThisYear.forEach(r => { racesMapping[r.raceId] = r; });
            setRacesMap(racesMapping);
        }
        fetchData();
    }, [gameId]);

    if (!gameData) return <div>Loading...</div>;

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

    const data: TransformedRace[] = meets.flatMap(meet => 
        meet.races.map(raceId => {
            const race = racesMap[raceId];
            const topWinner = getTopWinner(race);
            const topTeam = getTopTeam(race);
            const teamsPoints = race?.teams.map(team => `${teamsMap[team.teamId]?.college}: ${team.points}`).join(', ') || '';
            const teams = race?.teams.map(team => teamsMap[team.teamId]?.college).join(', ') || '';
            return {
                raceId,
                eventType: race?.eventType || '',
                meetId: meet.meetId,
                date: meet.date,
                topWinner: topWinner || '',
                topTeam: topTeam || '',
                points: teamsPoints,
                teams
            };
        })
    );

    const columns: { key: keyof TransformedRace; label: string }[] = [
        { key: 'raceId', label: 'Race ID' },
        { key: 'eventType', label: 'Event Type' },
        { key: 'meetId', label: 'Meet ID' },
        { key: 'date', label: 'Date' },
        { key: 'topWinner', label: 'Top Winner' },
        { key: 'topTeam', label: 'Top Team' },
    ];

    const getRowLink = (race: TransformedRace) => `/games/${gameId}/races/${race.raceId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Races Overview</h1>
            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['raceId']} />
        </div>
    );
}
