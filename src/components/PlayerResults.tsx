import Table from '@/components/Table';
import YearFilter from '@/components/YearFilterer';
import { useEffect, useState } from 'react';
import { loadRaces, loadGameData, loadMeets } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import { Game } from '@/types/game';

const PlayerResults = ({ gameId, playerId }: { gameId: number, playerId: number }) => {
    const [playerResults, setPlayerResults] = useState<{ meetWeek: number, meetYear: number, meetType: string, eventType: string, playerTime: string, points: number }[]>([]);
    const [currentYear, setCurrentYear] = useState<number>(2024);
    const [selectedYear, setSelectedYear] = useState<number | "all">(currentYear);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor(time * 100) % 100;
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        async function fetchData() {
            const gameData: Game = await loadGameData(gameId);

            const raceData: Race[] = await loadRaces(gameId);
            const meetData: Meet[] = await loadMeets(gameId);

            const years = new Set<number>();
            const results = raceData
                .flatMap(race => {
                    const meet = meetData.find(meet => meet.meetId === race.meetId);
                    if (!meet || (meet.week > gameData.currentWeek && meet.year === gameData.currentYear)) return [];

                    years.add(meet.year);

                    return race.participants
                        .filter(participant => participant.playerId === playerId && participant.playerTime > 0)
                        .map(participant => ({
                            meetWeek: meet.week,
                            meetYear: meet.year,
                            meetType: meet.type,
                            eventType: race.eventType,
                            playerTime: formatTime(participant.playerTime),
                            points: participant.scoring.points,
                        }));
                });

            setAvailableYears(Array.from(years));
            setCurrentYear(gameData.currentYear);
            setSelectedYear(gameData.currentYear);
            setPlayerResults(results);
        }
        fetchData();
    }, [gameId, playerId]);

    const filteredResults = selectedYear === "all" ? playerResults : playerResults.filter(result => result.meetYear === selectedYear);

    const columns: { key: "meetWeek" | "meetYear"| "meetType" | "eventType" | "playerTime" | "points"; label: string }[] = [
        { key: 'meetWeek', label: 'Meet Week' },
        { key: 'meetYear', label: 'Meet Year' },
        { key: 'meetType', label: 'Meet Type' },
        { key: 'eventType', label: 'Event Type' },
        { key: 'playerTime', label: 'Time' },
        { key: 'points', label: 'Points' },
    ];

    return (
        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
            <h2 className="text-xl font-semibold text-accent mb-2">Player Results</h2>
            <YearFilter
                availableYears={availableYears}
                currentYear={currentYear}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />
            <Table data={filteredResults} columns={columns} />
        </div>
    );
};

export default PlayerResults;
