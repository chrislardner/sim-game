"use client";

import { useParams } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { YearlyLeagueSchedule, Meet } from '@/types/schedule';
import Link from 'next/link';

export default function LeagueSchedulePage() {
    const { gameId } = useParams();
    const [leagueSchedule, setLeagueSchedule] = useState<YearlyLeagueSchedule | null>(null);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            setLeagueSchedule(gameData?.leagueSchedule || null);

            
            // Create a mapping of teamId to team college
            const teamsMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                accumlated[team.teamId] = team.college;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);
        }
        fetchData().catch(console.error);
    }, [gameId]);
    

    if (!leagueSchedule) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">League Schedule</h1>
            {leagueSchedule.meets
                .sort((a: { week: number; }, b: { week: number; }) => a.week - b.week)
                .map((meet: Meet, index: Key ) => (
                    <Link key={index} href={`/games/${gameId}/schedule/${meet.meetId}`}>

                    <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors mb-4">
                        <h2 className="text-xl font-semibold text-accent">Week {meet.week} - {meet.type}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Meet Type: <span className="font-semibold">{meet.season} - {meet.year}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Teams: {meet.teams.map(team => teamsMap[team as number]).join(', ')}</p>
                        <div className="mt-2">
                            <h3 className="text-lg font-semibold">Races:</h3>
                            <ul>
                                {meet.races.map((race, i) => (
                                    <li key={i} className="text-gray-700 dark:text-gray-300">Event: {race.eventType}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    </Link>
                ))}
        </div>
    );
}
