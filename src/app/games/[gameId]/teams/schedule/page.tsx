// src/app/games/[gameId]/teams/[teamId]/schedule/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { loadGameData } from '@/data/storage';
import { Team } from '@/types/team';
import { Meet } from '@/types/schedule';
import { useEffect, useState } from 'react';

export default function TeamSchedule() {
    const { gameId, teamId } = useParams();
    const [teamSchedule] = useState<Meet[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const team = gameData?.teams.find(t => t.teamId === Number(teamId));
            teamSchedule.map((meet, index) => ( 
                console.log(meet.teams)
            ));
        }
        fetchData();
    }, [gameId, teamId]);

    if (!teamSchedule.length) return <div>Loading...</div>;


    return (
        <div>
            <h1>Team Schedule</h1>
            <ul>
                {teamSchedule.map((meet, index) => (
                    <li key={index}>
                        <h3>Meet {meet.meetId} - {meet.date}</h3>
                        <p>Meet Type: {meet.meetType}</p>
                        
                        {/* <p>Participating Teams: {meet.teams.join(', ')}</p> */}
                        <ul>
                            {meet.races.map((race, i) => (
                                <li key={i}>
                                    {race.eventType} - Heats: {race.heats.length}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}
