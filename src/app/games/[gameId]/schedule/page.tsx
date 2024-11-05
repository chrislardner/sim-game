"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Meet } from '@/types/schedule';

export default function LeagueSchedule() {
    const { gameId } = useParams();
    const [leagueSchedule, setLeagueSchedule] = useState<Meet[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const allMeets = gameData?.teams.flatMap(team => team.schedule) || [];
            const uniqueMeets = Array.from(new Map(allMeets.map(meet => [meet.meetId, meet])).values());
            setLeagueSchedule(uniqueMeets);
        }
        fetchData();
    }, [gameId]);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">League Schedule</h1>
            <div className="space-y-6">
                {leagueSchedule.map((meet, index) => (
                    <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                        <h2 className="text-xl font-semibold text-accent">Meet {meet.meetId} - {meet.date}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Meet Type: <span className="font-semibold">{meet.meetType}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Participating Teams: <span className="font-semibold">{meet.teams.join(', ')}</span></p>
                        <ul className="mt-2">
                            {meet.races.map((race, i) => (
                                <li key={i} className="text-gray-700 dark:text-gray-300">
                                    {race.eventType} - Heats: {race.heats.length}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
