"use client";

import { useParams } from 'next/navigation';
import { Key, useEffect, useState } from 'react';
import { loadTeams, loadMeets, loadRaces, loadGameData } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import Link from 'next/link';
import { Team } from '@/types/team';
import { Game } from '@/types/game';

export default function LeagueSchedulePage() {
    const { gameId } = useParams();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [meets, setMeets] = useState<Meet[]>([]);
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>({});


    useEffect(() => {
        async function fetchData() {
            const gameData: Game = await loadGameData(Number(gameId));
            const teamsData: Team[] = await loadTeams(Number(gameId));
            const meetsData: Meet[] = await loadMeets(Number(gameId));
            const racesData: Race[] = await loadRaces(Number(gameId));
            const meetsThisYear = meetsData.filter(meet => meet.year === gameData.currentYear);
            setMeets(meetsThisYear);
            // Create a mapping of teamId to team college
            const teamsMapping = teamsData.reduce((accumlated: { [key: number]: Team }, team: Team) => {
                accumlated[team.teamId] = team;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);
            const racesMapping = racesData.reduce((accumlated: { [key: number]: Race }, race: Race) => {
                accumlated[race.raceId] = race;
                return accumlated;
            }, {});
            setRacesMap(racesMapping);
        }
        fetchData().catch(console.error);
    }, [gameId]);


    if (!meets) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">League Schedule</h1>
            {meets?.sort((a: { week: number; }, b: { week: number; }) => a.week - b.week)
                .map((meet: Meet, index: Key) => (
                    <Link key={index} href={`/games/${gameId}/schedule/${meet.meetId}`}>
                        <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors mb-4">
                            <h2 className="text-xl font-semibold text-accent">Week {meet.week} - {meet.type}</h2>
                            <p className="text-gray-700 dark:text-gray-300">Meet Type: <span className="font-semibold">{meet.season} - {meet.year}</span></p>
                            <p className="text-gray-700 dark:text-gray-300">Teams: {meet.teams.map(team => teamsMap[team.teamId]?.college).join(', ')}</p>
                            <div className="mt-2">
                                <h3 className="text-lg font-semibold">Races:</h3>
                                <ul>
                                    {meet.races.map((raceId, i) => (
                                        <li key={i} className="text-gray-700 dark:text-gray-300">Event: {racesMap[raceId]?.eventType}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Link>
                ))}
        </div>
    );
}
