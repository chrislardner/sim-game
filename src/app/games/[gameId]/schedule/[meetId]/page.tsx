"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadGameData } from '@/data/storage';
import { Meet } from '@/types/schedule';

export default function MeetPage() {
    const { gameId, meetId } = useParams();
    const [meet, setMeet] = useState<Meet | null>(null);
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const selectedMeet = gameData?.leagueSchedule.meets.find(m => m.meetId === Number(meetId));
            setMeet(selectedMeet || null);

            // Create a mapping of teamId to team college
            const teamsMapping = gameData.teams.reduce((accumlated: { [key: number]: string }, team) => {
                accumlated[team.teamId] = team.college;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);
        }
        fetchData();
    }, [gameId, meetId]);

    if (!meet) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Meet on {meet.date}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Season: <span className="font-semibold">{meet.season}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Type: <span className="font-semibold">{meet.type}</span></p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Teams Participating</h2>
            <ul className="list-disc list-inside mb-6">
                {meet.teams.map((teamId, index) => (
                    <li key={index} className="text-lg text-gray-700 dark:text-gray-300">{teamsMap[Number(teamId)]}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Races</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meet.races.map((race, index) => (
                    <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                        <h3 className="text-xl font-semibold text-accent">{race.eventType}</h3>
                        <p className="text-gray-700 dark:text-gray-300">Participants: <span className="font-semibold">{race.participants.length}</span></p>
                        <Link href={`/games/${gameId}/races/${race.raceId}`}>
                            <button className="px-4 py-2 bg-accent text-white rounded-lg transition hover:bg-accent-dark mt-4">
                                View Race Details
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}