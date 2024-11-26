"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGameData } from '@/data/storage';
import { Game } from '@/types/game';
import { Meet, Race } from '@/types/schedule';

export default function RacesOverviewPage() {
    const { gameId } = useParams();
    const [gameData, setGameData] = useState<Game | null>(null);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: string }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: string }>({});
    const [visibleRaceId, setVisibleRaceId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            setGameData(gameData);

            // Create a mapping of teamId to team college
            const teamsMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                accumlated[team.teamId] = team.college;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);

            // Create a mapping of playerId to player name
            const playersMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                team.players.forEach(player => {
                    accumlated[player.playerId] = player.firstName + ' ' + player.lastName;
                });
                return accumlated;
            }, {});
            setPlayersMap(playersMapping);
        }
        fetchData();
    }, [gameId]);

    if (!gameData) return <div>Loading...</div>;

    const getTopWinners = (race: Race) => {
        const playerTimes: { playerId: number, time: number }[] = [];
        race.heats.forEach(heat => {
            Object.entries(heat.playerTimes).forEach(([playerId, time]) => {
                playerTimes.push({ playerId: Number(playerId), time });
            });
        });
        playerTimes.sort((a, b) => a.time - b.time);
        return playerTimes.slice(0, 5).map(({ playerId, time }) => ({
            player: playersMap[playerId],
            team: teamsMap[gameData!.teams.find(team => team.players.some(player => player.playerId === playerId))!.teamId],
            time
        }));
    };

    const toggleRaceVisibility = (raceId: number) => {
        setVisibleRaceId(visibleRaceId === raceId ? null : raceId);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Races Overview</h1>
            {gameData.leagueSchedule.meets.map((meet: Meet) => (
                <div key={meet.meetId} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-2 text-secondary-dark dark:text-secondary-dark">
                        Meet {meet.meetId} - {meet.date}
                    </h2>
                    <div className="">
                        {meet.races.map((race: Race) => (
                            <Link key={race.raceId} href={`/games/${gameId}/races/${race.raceId}`}>
                                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors mb-4">
                                    <h3 className="text-xl font-semibold text-accent">Event: {race.eventType}</h3>
                                    <p className="font-semibold text-text-dark">Race ID: {race.raceId}</p>
                                    <button
                                        className="px-4 py-2 font-semibold bg-accent text-text-light rounded-lg transition hover:text-accent-dark mt-4"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleRaceVisibility(race.raceId);
                                        }}>
                                        {visibleRaceId === race.raceId ? 'Hide Top Winners' : 'View Top Winners'}
                                    </button>
                                    {visibleRaceId === race.raceId && (
                                        <div className="mt-4">
                                            <h4 className="text-lg font-semibold text-accent">Top 5 Winners:</h4>
                                            <ul>
                                                {getTopWinners(race).map((winner, idx) => (
                                                    <li key={`${winner.player}-${winner.time}-${idx}`} className="mt-2">
                                                        {winner.player} ({winner.team}) - {formatTime(winner.time)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}