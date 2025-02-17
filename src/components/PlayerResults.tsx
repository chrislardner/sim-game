import React, { useEffect, useState } from 'react';
import { Game } from '@/types/game';
import { Meet, Race } from '@/types/schedule';
import { loadGameData, loadMeets, loadRaces } from '@/data/storage';
import YearFilter from './YearFilterer';
import Table from './Table';

interface PlayerResultsProps {
    gameId: number;
    playerId: number;
}

const PlayerResults: React.FC<PlayerResultsProps> = ({ gameId, playerId }) => {
    interface PlayerResult {
        meetWeek: number;
        meetYear: number;
        meetType: string;
        eventType: string;
        playerTime: number;
        formattedTime: string;
        points: number;
        timeFromAverage: string;
    }

    const [playerResults, setPlayerResults] = useState<PlayerResult[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [currentYear, setCurrentYear] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [averageTimes, setAverageTimes] = useState<{ [eventType: string]: { [year: number]: number, overall: number } }>({});

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor(time * 100) % 100;
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        async function fetchData() {
            const gameData: Game = await loadGameData(gameId);
            const raceData: Race[] = await loadRaces(gameId);
            const meetData: Meet[] = await loadMeets(gameId);

            const years = new Set<number>();
            // First, create results without timeFromAverage
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
                            playerTime: participant.playerTime,
                            formattedTime: formatTime(participant.playerTime),
                            points: participant.scoring.points,
                            timeFromAverage: '',
                        }));
                });

            // Calculate average times
            const averages: { [eventType: string]: { [year: number]: number, overall: number } } = {};
            results.forEach(result => {
                if (!averages[result.eventType]) {
                    averages[result.eventType] = { overall: 0 };
                }
                if (!averages[result.eventType][result.meetYear]) {
                    averages[result.eventType][result.meetYear] = 0;
                }
                averages[result.eventType][result.meetYear] += result.playerTime;
                averages[result.eventType].overall += result.playerTime;
            });

            Object.keys(averages).forEach(eventType => {
                const yearKeys = Object.keys(averages[eventType]).filter(year => year !== 'overall');
                yearKeys.forEach(year => {
                    averages[eventType][Number(year)] /= results.filter(result => result.eventType === eventType && result.meetYear === Number(year)).length;
                });
                averages[eventType].overall /= results.filter(result => result.eventType === eventType).length;
            });

            // Update results with timeFromAverage based on computed averages
            const updatedResults = results.map(result => {
                const avg = averages[result.eventType].overall;
                const difference = result.playerTime - avg;
                const sign = difference > 0 ? '+' : '-';
                return {
                    ...result,
                    timeFromAverage: `${sign}${formatTime(Math.abs(difference))}`,
                };
            });

            setAvailableYears(Array.from(years));
            setCurrentYear(gameData.currentYear);
            setSelectedYear(gameData.currentYear);
            setPlayerResults(updatedResults);
            setAverageTimes(averages);
        }
        fetchData();
    }, [gameId, playerId]);

    const filteredResults = selectedYear === "all" ? playerResults : playerResults.filter(result => result.meetYear === selectedYear);

    const columns: { key: "timeFromAverage" | "meetWeek" | "meetYear" | "meetType" | "eventType" | "formattedTime" | "points"; label: string }[] = [
        { key: 'meetWeek', label: 'Meet Week' },
        { key: 'meetYear', label: 'Meet Year' },
        { key: 'meetType', label: 'Meet Type' },
        { key: 'eventType', label: 'Event Type' },
        { key: 'formattedTime', label: 'Time' },
        { key: 'points', label: 'Points' },
        { key: 'timeFromAverage', label: 'Time from Average' },
    ];

    const averageTimesColumns: { key: "eventType" | "year" | "averageTime"; label: string }[] = [
        { key: 'eventType', label: 'Event Type' },
        { key: 'year', label: 'Year' },
        { key: 'averageTime', label: 'Average Time' },
    ];

    const averageTimesData = Object.keys(averageTimes).flatMap(eventType => {
        return Object.keys(averageTimes[eventType]).map(year => ({
            eventType,
            year: year === 'overall' ? 'Overall' : year,
            averageTime: formatTime(Number(averageTimes[eventType][year as 'overall' | number])),
        }));
    });

    return (
        <div>
            <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
                <h2 className="text-xl font-semibold text-accent mb-2">Average Times</h2>
                <Table data={averageTimesData} columns={averageTimesColumns} />
            </div>
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
        </div>
    );
};

export default PlayerResults;
