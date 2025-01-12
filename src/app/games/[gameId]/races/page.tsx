"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams } from '@/data/storage';
import { Game } from '@/types/game';
import { Meet, Race } from '@/types/schedule';
import { Player } from '@/types/player';
import { Team } from '@/types/team';
import { use } from 'react';

export default function RacesOverviewPage({ params }: { params: Promise<{ gameId: string }> }) {
    const router = useRouter();
    const { gameId } = use(params);
    const [gameData, setGameData] = useState<Game>();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>();
    const [playersMap, setPlayersMap] = useState<{ [key: number]: Player }>();
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>();
    const [teams, setTeams] = useState<Team[]>([]);
    const [meets, setMeets] = useState<Meet[]>([]);
    const [visibleRaceId, setVisibleRaceId] = useState<number | null>(null);

    useEffect(() => {
        if (!gameId) return;

        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            setGameData(gameData);
            const teamData = await loadTeams(Number(gameId));
            setTeams(teamData);
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

            const playersMapping = teamData.reduce((accumlated: { [key: number]: Player }, team) => {
                team.players.forEach(playerId => {
                    const player = playersData.find(p => p.playerId === playerId);
                    if (player) {
                        accumlated[playerId] = player;
                    }
                });
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

    const getTopWinners = (race: Race) => {
        const playerTimes = race?.participants.map(participant => ({
            playerId: participant.playerId,
            playerTime: participant.playerTime,
            points: participant.scoring.points
        }));
        playerTimes?.sort((a, b) => a.playerTime - b.playerTime);
        return playerTimes?.slice(0, 5).map(({ playerId, playerTime }) => ({
            player: playersMap?.[playerId],
            team: teamsMap?.[teams.find(team => team.players.some(pId => pId === playerId))?.teamId ?? -1],
            time: playerTime
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

    const handleRaceClick = (raceId: number) => {
        router.push(`/games/${gameId}/races/${raceId}`);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Races Overview</h1>

            {meets.map((meet: Meet) => (
                <div key={meet.meetId} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-2 text-secondary-dark dark:text-secondary-dark">
                        Meet {meet.meetId} - {meet.date}
                    </h2>
                    <div className="">
                        {meet.races.map((raceId: number) => (
                            <div
                                key={raceId}
                                className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors mb-4 cursor-pointer"
                                onClick={() => handleRaceClick(raceId)}
                            >
                                <h3 className="text-xl font-semibold text-accent">Event: {racesMap?.[raceId]?.eventType}</h3>
                                <p className="font-semibold text-text-dark">Race ID: {raceId}</p>
                                <button
                                    className="px-4 py-2 font-semibold bg-accent text-text-light rounded-lg transition bg-accent-dark mt-4 hover:bg-accent-light hover:text-text-dark"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRaceVisibility(raceId);
                                    }}>
                                    {visibleRaceId === raceId ? 'Hide Top Winners' : 'View Top Winners'}
                                </button>
                                {visibleRaceId === raceId && (
                                    <div className="mt-4">
                                        <h4 className="text-lg font-semibold text-accent">Top 5 Winners:</h4>
                                        <ul>
                                            {racesMap && getTopWinners(racesMap[raceId])?.map((winner, idx) => (
                                                <li key={`${winner.player}-${winner.time}-${idx}`} className="mt-2">
                                                    {winner.player?.firstName + " " + winner.player?.lastName} ({winner.team?.college}) - {formatTime(winner.time)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
