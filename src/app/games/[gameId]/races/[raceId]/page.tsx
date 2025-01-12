"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadMeets, loadPlayers, loadRaces, loadTeams } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import { Player } from '@/types/player';
import { Team } from '@/types/team';

export default function RaceResultsPage({ params }: { params: Promise<{ gameId: string, raceId: string }> }) {
    const router = useRouter();
    const [unwrappedParams, setUnwrappedParams] = useState<{ gameId: string, raceId: string } | null>(null);
    const [race, setRace] = useState<Race>();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: { player: Player, team: Team } }>({});
    const [meet, setMeet] = useState<Meet>();
    const [teamPoints, setTeamPoints] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        async function fetchData() {
            if (unwrappedParams?.gameId && unwrappedParams?.raceId) {
                const { gameId, raceId } = unwrappedParams;
                const raceData = await loadRaces(Number(gameId));
                const playerData = await loadPlayers(Number(gameId));
                const meetData = await loadMeets(Number(gameId));
                const teams: Team[] = await loadTeams(Number(gameId));

                const selectRace = raceData.find(r => r.raceId === Number(raceId));
                const selectMeet = meetData.find(m => m.meetId === Number(selectRace?.meetId));

                setRace(selectRace);
                setMeet(selectMeet);
                const selectPlayers = playerData.filter(player => selectRace?.participants.some(participant => participant.playerId === player.playerId));

                // Create a mapping of teamId to team college
                const teamsMapping: { [key: number]: Team } = {};
                teams.forEach(t => { teamsMapping[t.teamId] = t; });
                setTeamsMap(teamsMapping);

                // Create a mapping of playerId to player first name and player team college
                const playersMapping = teams.reduce((accumlated: { [key: number]: { player: Player, team: Team } }, team) => {
                    team.players.forEach(playerId => {
                        const player = selectPlayers.find(p => p.playerId === playerId);
                        if (player) {
                            accumlated[playerId] = {
                                player,
                                team,
                            };
                        }
                    });
                    return accumlated;
                }, {});
                setPlayersMap(playersMapping);

                const teamPoints = selectRace?.teams.reduce((accumulated: { [key: number]: number }, team) => {
                    if(team.points > 0) {
                        accumulated[team.teamId] = team.points;
                    }
                    return accumulated;
                }, {});
                if (teamPoints) {
                    setTeamPoints(teamPoints);
                }
            }
        }
        fetchData();
    }, [unwrappedParams]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    if (!race) return <div>Loading...</div>;

    const sortedParticipants = race.participants
        .sort((a, b) => a.playerTime - b.playerTime)
        .map((participant, index) => ({
            ...participant,
            position: index + 1,
        }));

    const sortedTeamPoints = Object.entries(teamPoints).sort(([, pointsA], [, pointsB]) => {
        if (meet?.season === 'cross_country') {
            return Number(pointsA) - Number(pointsB); // Less points first
        } else {
            return Number(pointsB) - Number(pointsA); // More points first
        }
    });

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Race Results</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 cursor-pointer" onClick={() => router.push(`/games/${unwrappedParams?.gameId}/schedule/${meet?.meetId}`)}>
                Meet: <span className="font-semibold">{meet?.week} - {meet?.season}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">Teams: {meet?.teams.map(team => teamsMap[team.teamId].college).join(', ')}</p>
            <p className="text-gray-700 dark:text-gray-300">Event: <span className="font-semibold">{race?.eventType}</span></p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Results</h2>
            <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Position</th>
                        <th className="py-2 px-4 border-b">Player</th>
                        <th className="py-2 px-4 border-b">Team</th>
                        <th className="py-2 px-4 border-b">Time</th>
                        <th className="py-2 px-4 border-b">Points</th>
                    </tr>
                </thead>
                <tbody className="min-w-full">
                    {sortedParticipants.map(({ playerId, playerTime, scoring: { points }, position }) => (
                        <tr key={playerId}>
                            <td className="py-2 px-4 border-b text-center">{position}</td>
                            <td className="py-2 px-4 border-b text-center cursor-pointer" onClick={() => router.push(`/games/${unwrappedParams?.gameId}/players/${playerId}`)}>
                                {playersMap[Number(playerId)]?.player.firstName + ' ' + playersMap[Number(playerId)]?.player.lastName}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                                {playersMap[Number(playerId)]?.team.college}
                            </td>
                            <td className="py-2 px-4 border-b text-center">{formatTime(playerTime)}</td>
                            <td className="py-2 px-4 border-b text-center">{points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Team Points</h2>
            <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Team</th>
                        <th className="py-2 px-4 border-b">Points</th>
                    </tr>
                </thead>
                <tbody className="min-w-full">
                    {sortedTeamPoints.map(([teamId, points]) => (
                        <tr key={teamId}>
                            <td className="py-2 px-4 border-b text-center">{teamsMap[Number(teamId)].college}</td>
                            <td className="py-2 px-4 border-b text-center">{points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
