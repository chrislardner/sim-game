"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadMeets, loadRaces, loadTeams } from '@/data/storage';
import { Meet, Race } from '@/types/schedule';
import { Team } from '@/types/team';

export default function MeetPage() {
    const router = useRouter();
    const { gameId, meetId } = useParams();
    const [meet, setMeet] = useState<Meet>();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [teamPoints, setTeamPoints] = useState<{ [key: number]: number }>({});
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>({});

    useEffect(() => {
        async function fetchData() {
            const meets = await loadMeets(Number(gameId));
            const selectedMeet = meets.find(meet => meet.meetId === Number(meetId));
            if (!selectedMeet) throw new Error('Meet not found');
            setMeet(selectedMeet);

            const teamsData = await loadTeams(Number(gameId));
            const racesData = await loadRaces(Number(gameId));

            // Create a mapping of teamId to team college
            const teamsMapping: { [key: number]: Team } = {};
            teamsData.forEach(t => teamsMapping[t.teamId] = t);
            setTeamsMap(teamsMapping);

            // Calculate team points
            const pointsMapping = selectedMeet.teams.reduce((accumulated: { [key: number]: number }, team) => {
                if (team.points > 0) {
                    accumulated[team.teamId] = team.points;
                }
                return accumulated;
            }, {});
            setTeamPoints(pointsMapping);

            // Calculate team points for each race, excluding teams with 0 points
            const racePointsMapping: { [key: number]: { [key: number]: number } } = {};
            selectedMeet.races.forEach(raceId => {
                racePointsMapping[raceId] = racesData.reduce((accumulated: { [key: number]: number }, race) => {
                    race.teams.forEach(team => {
                        if (team.points > 0) {
                            accumulated[team.teamId] = team.points;
                        }
                    });
                    return accumulated;
                }, {});
            });

            const racesMapping: { [key: number]: Race } = {};
            racesData.forEach(r => { racesMapping[r.raceId] = r; });
            setRacesMap(racesMapping);
        }
        fetchData();
    }, [gameId, meetId]);

    if (!meet) return <div>Loading...</div>;

    // Determine sorting order based on meet type
    const sortedTeamPoints = Object.entries(teamPoints).sort(([, pointsA], [, pointsB]) => {
        if (meet.season === 'track_field') {
            return pointsB - pointsA; // Descending order for track and field
        } else if (meet.season === 'cross_country') {
            return pointsA - pointsB; // Ascending order for cross country
        }
        return 0;
    });

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Meet on {meet.date}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Season: <span className="font-semibold">{meet.season}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Type: <span className="font-semibold">{meet.type}</span></p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Team Points</h2>
            <ul className="list-disc list-inside mb-6">
                {sortedTeamPoints.map(([teamId, points]) => (
                    <li key={teamId} className="text-lg text-gray-700 dark:text-gray-300">{teamsMap[Number(teamId)]?.college}: {points} points</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Teams Participating</h2>
            <ul className="list-disc list-inside mb-6">
                {meet.teams.map((team, index) => (
                    <li key={index} className="text-lg text-gray-700 dark:text-gray-300">{teamsMap[Number(team?.teamId)]?.college}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Races</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meet.races.map((raceId, index) => {
                    return (
                        <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                            <h3 className="text-xl font-semibold text-accent">{racesMap[raceId]?.eventType}</h3>
                            <p className="text-gray-700 dark:text-gray-300">Participants: <span className="font-semibold">{racesMap[raceId]?.participants.length}</span></p>
                            <h4 className="text-lg font-semibold mt-2">Team Points</h4>
                            <ul className="list-disc list-inside mb-4">
                                {sortedTeamPoints
                                    .map(([teamId, points]) => (
                                        <li key={teamId} className="text-gray-700 dark:text-gray-300">{teamsMap[Number(teamId)]?.college}: {points} points</li>
                                    ))}
                            </ul>
                            <button
                                className="px-4 py-2 bg-accent bg-accent-dark text-white rounded-lg transition hover:bg-accent-light mt-4"
                                onClick={() => router.push(`/games/${gameId}/races/${raceId}`)}
                            >
                                View Race Details
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
