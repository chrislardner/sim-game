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
    const [teamPoints, setTeamPoints] = useState<{ [key: number]: number }>({});
    const [racePoints, setRacePoints] = useState<{ [key: number]: { [key: number]: number } }>({});

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

            // Calculate team points
            const pointsMapping = meet?.teams.reduce((accumlated: { [key: number]: number }, team) => {
                if (team.points > 0) {
                    accumlated[team.teamId] = team.points;
                }
                return accumlated;
            }, {}) || {};
            setTeamPoints(pointsMapping);

            // Calculate team points for each race, excluding teams with 0 points
            const racePointsMapping: { [key: number]: { [key: number]: number } } = {};
            meet?.races.forEach(race => {
                racePointsMapping[race.raceId] = race.teams.reduce((accumulated: { [key: number]: number }, team) => {
                    if (team.points > 0) {
                        accumulated[team.teamId] = team.points;
                    }
                    return accumulated;
                }, {});
            });
            
            setRacePoints(racePointsMapping);
        }
        fetchData();
    }, [gameId, meetId, meet?.races, meet?.season]);

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

    const handleTestData = () => {
        console.log(meet, "meet");
        console.log(meet?.races, "races");
        meet?.races.forEach(race => {
            console.log(race, "race");
            console.log(race.teams, "teams");
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Meet on {meet.date}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Season: <span className="font-semibold">{meet.season}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Type: <span className="font-semibold">{meet.type}</span></p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Team Points</h2>
            <ul className="list-disc list-inside mb-6">
                {sortedTeamPoints.map(([teamId, points]) => (
                    <li key={teamId} className="text-lg text-gray-700 dark:text-gray-300">{teamsMap[Number(teamId)]}: {points} points</li>
                ))}
            </ul>

            
            <button onClick={handleTestData} className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4">
                Test Data
            </button>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Teams Participating</h2>
            <ul className="list-disc list-inside mb-6">
                {meet.teams.map((team, index) => (
                    <li key={index} className="text-lg text-gray-700 dark:text-gray-300">{teamsMap[Number(team?.teamId)]}</li>
                ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Races</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meet.races.map((race, index) => {
                    return (
                        <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                            <h3 className="text-xl font-semibold text-accent">{race.eventType}</h3>
                            <p className="text-gray-700 dark:text-gray-300">Participants: <span className="font-semibold">{race.participants.length}</span></p>
                            <h4 className="text-lg font-semibold mt-2">Team Points</h4>
                            <ul className="list-disc list-inside mb-4">
                                {Object.entries(racePoints[race.raceId] || {})
                                    .sort(([, pointsA], [, pointsB]) => {
                                        if (meet.season === 'track_field') {
                                            return pointsB - pointsA; // Descending order for track and field
                                        } else if (meet.season === 'cross_country') {
                                            return pointsA - pointsB; // Ascending order for cross country
                                        }
                                        return 0;
                                    })
                                    .map(([teamId, points]) => (
                                        <li key={teamId} className="text-gray-700 dark:text-gray-300">{teamsMap[Number(teamId)]}: {points} points</li>
                                    ))}
                            </ul>
                            <Link href={`/games/${gameId}/races/${race.raceId}`}>
                                <button className="px-4 py-2 bg-accent bg-accent-dark text-white rounded-lg transition hover:bg-accent-light mt-4">
                                    View Race Details
                                </button>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

