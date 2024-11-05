// src/app/games/[gameId]/schedule/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { loadGameData } from '@/data/storage';
import { useEffect, useState } from 'react';
import { Meet } from '@/types/event';

export default function LeagueSchedule() {
    const { gameId } = useParams();
    const [leagueSchedule, setLeagueSchedule] = useState<Meet[]>([]);

    useEffect(() => {
        async function fetchData() {
            const gameData = await loadGameData(Number(gameId));
            const allMeets: Meet[] = gameData?.teams.flatMap(team => team.schedule.flatMap(week => week.meets as unknown as Meet[])) || [];
            const uniqueMeets = Array.from(new Map(allMeets.map((meet: Meet) => [meet.meetId, meet])).values());
            setLeagueSchedule(uniqueMeets);
            const allTeamSched: Meet[] = gameData?.teams.flatMap(team => team.schedule as unknown as Meet[]) || [];
            console.log(allTeamSched)
        }
        fetchData();
    }, [gameId]);

    if (!leagueSchedule.length) return <div>Loading...</div>;

    return (
        <div>
            <h1>League Schedule</h1>
            <ul>
                {leagueSchedule.map((meet, index) => (
                    <li key={index}>
                        <h3>Meet {meet.meetId} - {meet.date}</h3>
                        <p>Meet Type: {meet.type}</p>
                        {/* <p>Participating Teams: {meet.teams.join(', ')}</p> */}
                        <ul>
                            {/* {meet.races.map((race, i) => (
                                <li key={i}>
                                    {race.eventType} - Heats: {race.heats.length}
                                </li>
                            ))} */}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}
