"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMeets, loadRaces, loadTeams } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import { Team } from '@/types/team';

export default function TeamSchedulePage() {
    const { gameId, teamId } = useParams();
    const [team, setTeam] = useState<Team>();
    const [meets, setTeamMeets] = useState<Meet[]>();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [raceMap, setRaceMap] = useState<{ [key: number]: Race }>({});

    useEffect(() => {
        async function fetchData() {
            const teamData = await loadTeams(Number(gameId));
            const selectedTeam = teamData.find(t => t.teamId === Number(teamId));
            setTeam(selectedTeam);

            const meetData = await loadMeets(Number(gameId));
            const teamMeets = meetData.filter((m: Meet) => m.teams.some(team => team.teamId === Number(teamId)));
            setTeamMeets(teamMeets);

            const raceData: Race[] = await loadRaces(Number(gameId));

            // Create a mapping of teamId to team college
            const teamsMapping = teamData.reduce((accumlated: { [key: number]: Team }, team) => {
                accumlated[team.teamId] = team;
                return accumlated;
            }, {});
            setTeamsMap(teamsMapping);
         
            // Create a mapping of raceId to race
            const racesMapping: { [key: number]: Race } = {};
            raceData.forEach(r => racesMapping[r.raceId] = r);
            setRaceMap(racesMapping);
        }
        fetchData();
    }, [gameId, teamId]);


    return (
        <div className="p-4">
            
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Team Schedule</h1>
            <h2 className="text-2xl font-semibold mb-4 text-primary-light dark:text-primary-dark">{team?.college}</h2>
            {meets && meets
                .sort((a, b) => a.week - b.week)
                .map((meet: Meet) => (
                    <Link key={`${meet.meetId}-${meet.week}`} href={`/games/${gameId}/schedule/${meet.meetId}`}>
                    <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors mb-4">
                        <h2 className="text-xl font-semibold text-accent">Week {meet.week} - {meet.type}</h2>
                        <p className="text-gray-700 dark:text-gray-300">Meet Type: <span className="font-semibold">{meet.season} - {meet.year}</span></p>
                        <p className="text-gray-700 dark:text-gray-300">Meet ID: <span className="font-semibold">{meet.meetId}</span></p>

                        <p className="text-gray-700 dark:text-gray-300">Teams: {meet.teams.map(team => teamsMap[team.teamId]?.college).join(', ')}</p>
                        <div className="mt-2">
                            <h3 className="text-lg font-semibold">Races:</h3>
                            <ul>
                                {meet.races.map((raceId, i) => (
                                    <li key={`${meet.meetId}-${i}`} className="text-gray-700 dark:text-gray-300">Event: {raceMap[raceId]?.eventType}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    </Link>
                ))}
        </div>
    );
}
