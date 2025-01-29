import Table from '@/components/Table';
import { useEffect, useState } from 'react';
import { loadRaces, loadGameData, loadMeets } from '@/data/storage';

const PlayerResults = ({ gameId, playerId }: { gameId: number, playerId: number }) => {
    const [playerResults, setPlayerResults] = useState<{ meetId: number, raceId: number, eventType: string, playerTime: string, points: number, teamTopFive: boolean, teamTopSeven: boolean }[]>([]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor(time * 100) % 100;
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(gameId);

            const raceData = await loadRaces(gameId);
            const meetData = await loadMeets(gameId);

            const results = raceData
                .flatMap(race => {
                    const meet = meetData.find(meet => meet.meetId === race.meetId);
                    if (!meet || (meet.week > gameData.currentWeek) && meet.year === gameData.year) return [];

                    return race.participants
                        .filter(participant => participant.playerId === playerId && participant.playerTime > 0)
                        .map(participant => ({
                            meetId: race.meetId,
                            raceId: race.raceId,
                            eventType: race.eventType,
                            playerTime: formatTime(participant.playerTime),
                            points: participant.scoring.points,
                            teamTopFive: participant.scoring.team_top_five,
                            teamTopSeven: participant.scoring.team_top_seven,
                        }));
                });

            setPlayerResults(results);
        }
        fetchData();
    }, [gameId, playerId]);

    const columns: { key: "meetId" | "raceId" | "eventType" | "playerTime" | "points"; label: string }[] = [
        { key: 'meetId', label: 'Meet ID' },
        { key: 'raceId', label: 'Race ID' },
        { key: 'eventType', label: 'Event Type' },
        { key: 'playerTime', label: 'Time' },
        { key: 'points', label: 'Points' },
    ];

    return (
        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
            <h2 className="text-xl font-semibold text-accent mb-2">Player Results</h2>
            <Table data={playerResults} columns={columns} />
        </div>
    );
};

export default PlayerResults;
