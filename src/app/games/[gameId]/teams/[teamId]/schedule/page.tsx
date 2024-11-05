"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadGameData } from '@/data/storage';
import { Meet } from '@/types/schedule';

export default function TeamSchedulePage() {
    const { gameId, teamId } = useParams();
    const [teamSchedule, setTeamSchedule] = useState<Meet[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const team = gameData?.teams.find(t => t.teamId === Number(teamId));
            setTeamSchedule(team?.schedule || []);
        }
        fetchData();
    }, [gameId, teamId]);

    if (!teamSchedule.length) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Team Schedule</h1>
            <div className="space-y-4">
                {teamSchedule.map((meet, index) => (
                    <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                        <h2 className="text-xl font-semibold text-accent">Meet {meet.meetId} - {meet.date}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Type: <span className="font-semibold">{meet.meetType}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Participating Teams: {meet.teams.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
