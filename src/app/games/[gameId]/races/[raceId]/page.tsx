"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGameData } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';

export default function RaceResultsPage() {
    const { gameId, raceId } = useParams();
    const [race, setRace] = useState<Race | null>(null);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: string }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: {name: string, college: string} }>({});
    const [meet, setMeet] = useState<Meet | null>(null);
    const [teamPoints, setTeamPoints] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const selectedRace =
                gameData.leagueSchedule.meets
                    .flatMap(meet => meet.races)
                    .find(race => race.raceId === Number(raceId));

            setRace(selectedRace || null);

            if (selectedRace) {
                const selectedMeet = gameData.leagueSchedule.meets.find(meet => meet.races.some(r => r.raceId === selectedRace.raceId));
                setMeet(selectedMeet || null);
            }

            // Create a mapping of teamId to team college
            const teamsMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                accumlated[team.teamId] = team.college;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);

            // Create a mapping of playerId to player first name and player team college
            const playersMapping = gameData.teams.reduce((accumlated: { [key: number]: {name: string, college: string} }, team) => {
                team.players.forEach(player => {
                    accumlated[player.playerId] = {
                        name: player.firstName + ' ' + player.lastName,
                        college: team.college
                    };
                });
                return accumlated;
            }, {});
            setPlayersMap(playersMapping);

            // Calculate team points
            const pointsMapping = selectedRace?.participants.reduce((accumlated: { [key: number]: number }, participant) => {
                const teamId = gameData.teams.find(team => team.players.some(player => player.playerId === participant.playerId))?.teamId;
                if (teamId !== undefined) {
                    accumlated[teamId] = (accumlated[teamId] || 0) + participant.scoring.points;
                }
                return accumlated;
            }, {}) || {};
            setTeamPoints(pointsMapping);
        }
        fetchData();
    }, [gameId, raceId]);

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
            <Link href={`/games/${gameId}/schedule/${meet?.meetId}`}>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Meet: <span className="font-semibold">{meet?.week} - {meet?.season}</span></p>
            </Link>
            <p className="text-gray-700 dark:text-gray-300">Teams: {meet?.teams.map(team => teamsMap[team.teamId]).join(', ')}</p>
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
                            <td className="py-2 px-4 border-b text-center">
                                <Link href={`/games/${gameId}/players/${playerId}`}>
                                    {playersMap[Number(playerId)]?.name}
                                </Link>
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                                {playersMap[Number(playerId)]?.college}
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
                            <td className="py-2 px-4 border-b text-center">{teamsMap[Number(teamId)]}</td>
                            <td className="py-2 px-4 border-b text-center">{points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}