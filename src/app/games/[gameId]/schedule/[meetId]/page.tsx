"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadMeets, loadRaces, loadTeams, loadPlayers } from '@/data/storage';
import { Meet, Race, RaceParticipant } from '@/types/schedule';
import { Team } from '@/types/team';
import { Player } from '@/types/player';
import Table from '@/components/Table';

export default function MeetPage() {
    const router = useRouter();
    const { gameId, meetId } = useParams();
    const [meet, setMeet] = useState<Meet>();
    const [teamsMap, setTeamsMap] = useState<{ [key: number]: Team }>({});
    const [teamPoints, setTeamPoints] = useState<{ [key: number]: number }>({});
    const [racesMap, setRacesMap] = useState<{ [key: number]: Race }>({});
    const [playersMap, setPlayersMap] = useState<{ [key: number]: Player }>({});
    const [viewMode, setViewMode] = useState<'teamPoints' | 'playerPerformance'>('teamPoints');

    useEffect(() => {
        async function fetchData() {
            const meets = await loadMeets(Number(gameId));
            const selectedMeet = meets.find(meet => meet.meetId === Number(meetId));
            if (!selectedMeet) throw new Error('Meet not found');
            setMeet(selectedMeet);

            const teamsData = await loadTeams(Number(gameId));
            const racesData = await loadRaces(Number(gameId));
            const playersData = await loadPlayers(Number(gameId));

            const teamsMapping: { [key: number]: Team } = {};
            teamsData.forEach(t => teamsMapping[t.teamId] = t);
            setTeamsMap(teamsMapping);

            const pointsMapping = selectedMeet.teams.reduce((accumulated: { [key: number]: number }, team) => {
                if (team.points > 0) {
                    accumulated[team.teamId] = team.points;
                }
                return accumulated;
            }, {});
            setTeamPoints(pointsMapping);

            const racesMapping: { [key: number]: Race } = {};
            racesData.forEach(r => { racesMapping[r.raceId] = r; });
            setRacesMap(racesMapping);

            const playersMapping: { [key: number]: Player } = {};
            playersData.forEach(p => { playersMapping[p.playerId] = p; });
            setPlayersMap(playersMapping);
        }
        fetchData();
    }, [gameId, meetId]);

    if (!meet) return <div>Loading...</div>;

    const sortedTeamPoints = Object.entries(teamPoints).sort(([, pointsA], [, pointsB]) => {
        if (meet.season === 'track_field') {
            return pointsB - pointsA;
        } else if (meet.season === 'cross_country') {
            if (pointsA === 0) return 1;
            if (pointsB === 0) return -1;
            return pointsA - pointsB;
        }
        return 0;
    });

    const toggleViewMode = () => {
        setViewMode(viewMode === 'teamPoints' ? 'playerPerformance' : 'teamPoints');
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Meet on {meet.date}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Season: <span className="font-semibold">{meet.season}</span></p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Type: <span className="font-semibold">{meet.type}</span></p>

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Team Points</h2>
            <Table
                data={sortedTeamPoints.map(([teamId, points]) => ({
                    team: teamsMap[Number(teamId)]?.college,
                    points
                }))}
                columns={[
                    { key: 'team', label: 'Team' },
                    { key: 'points', label: 'Points' }
                ]}
            />

            <h2 className="text-2xl font-semibold mt-6 mb-4 text-primary-light dark:text-primary-dark">Races</h2>
            <button
                className="px-4 py-2 bg-accent bg-accent-dark text-white rounded-lg transition hover:bg-accent-light mb-4"
                onClick={toggleViewMode}
            >
                Toggle View: {viewMode === 'teamPoints' ? 'Player Performance' : 'Team Points'}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meet.races.map((raceId, index) => {
                    const race = racesMap[raceId];
                    if (!race) return null;

                    return (
                        <div key={index} className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                            <h3 className="text-xl font-semibold text-accent">{race.eventType}</h3>
                            {viewMode === 'teamPoints' ? (
                                <Table
                                    data={race.teams.sort((a, b) => {
                                        if (meet.season === 'track_field') {
                                            return b.points - a.points;
                                        } else if (meet.season === 'cross_country') {
                                            if (a.points === 0) return 1;
                                            if (b.points === 0) return -1;
                                            return a.points - b.points;
                                        }
                                        return 0;
                                    }).map(team => ({
                                        team: teamsMap[team.teamId]?.college,
                                        points: team.points
                                    }))}
                                    columns={[
                                        { key: 'team', label: 'Team' },
                                        { key: 'points', label: 'Points' }
                                    ]}
                                />
                            ) : (
                                <Table
                                    data={race.participants.sort((a, b) => a.playerTime - b.playerTime).map((participant: RaceParticipant) => ({
                                        player: `${playersMap[participant.playerId]?.firstName} ${playersMap[participant.playerId]?.lastName}`,
                                        team: teamsMap[playersMap[participant.playerId]?.teamId]?.college,
                                        points: participant.scoring.points,
                                        time: formatTime(participant.playerTime)
                                    }))}
                                    columns={[
                                        { key: 'player', label: 'Player' },
                                        { key: 'team', label: 'Team' },
                                        { key: 'points', label: 'Points' },
                                        { key: 'time', label: 'Time' }
                                    ]}
                                />
                            )}
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
