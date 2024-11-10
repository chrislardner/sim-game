"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { TeamSchedule, Meet } from '@/types/schedule';

export default function TeamSchedulePage() {
    const { gameId, teamId } = useParams();
    const [teamSchedule, setTeamSchedule] = useState<TeamSchedule | null>(null);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const team = gameData?.teams.find(t => t.teamId === Number(teamId));
            console.log(team?.teamSchedule?.meets.length);
            if (team) setTeamSchedule(team.teamSchedule);
        }
        fetchData();
    }, [gameId, teamId]);

    if (!teamSchedule) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Team Schedule</h1>
            {teamSchedule.meets
                .sort((a, b) => a.week - b.week)
                .map((meet, index) => (
                    <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors mb-4">
                        <h2 className="text-xl font-semibold text-accent">Week {meet.week} - {meet.date}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Meet Type: <span className="font-semibold">{meet.meetType}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Teams: {meet.teams.map(team => team.teamName).join(', ')}</p>
                        <div className="mt-2">
                            <h3 className="text-lg font-semibold">Races:</h3>
                            <ul>
                                {meet.races.map((race, i) => (
                                    <li key={i} className="text-gray-700 dark:text-gray-300">Event: {race.eventType}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
        </div>
    );
}
