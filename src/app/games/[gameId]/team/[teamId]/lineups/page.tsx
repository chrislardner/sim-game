'use client';

import React, {use, useCallback, useEffect, useMemo, useState} from 'react';
import {Player} from '@/types/player';
import {Meet, Race, TeamLineup} from '@/types/schedule';
import {Team} from '@/types/team';
import {loadActivePlayers, loadGameData, loadMeets, loadRaces, loadTeams, saveRace} from "@/data/storage";

function isPlayerEligibleForRace(player: Player, race: Race, meet: Meet): boolean {
    const playerEvents = player.eventTypes[meet.season] || [];
    return playerEvents.includes(race.eventType);
}

function getTeamLineup(race: Race, teamId: number): TeamLineup {
    return race.lineupsByTeam?.[teamId] || {declared: [], locked: false};
}

function updateRaceLineup(race: Race, teamId: number, newLineup: TeamLineup): Race {
    const existingLineups = race.lineupsByTeam || {};

    const cloned: Record<number, TeamLineup> = {};
    for (const [key, value] of Object.entries(existingLineups)) {
        cloned[Number(key)] = {
            declared: [...value.declared],  // Clone the array
            locked: value.locked
        };
    }

    cloned[teamId] = {
        declared: [...newLineup.declared],
        locked: newLineup.locked
    };

    return {
        ...race,
        lineupsByTeam: cloned
    };
}

function getYearText(year: number): string {
    const years = ['Fr', 'So', 'Jr', 'Sr', 'RS'];
    return years[year - 1] || `Yr ${year}`;
}

function eventDistanceToString(eventType: string): 'sprint' | 'middle' | 'distance' | undefined {
    switch (eventType) {
        case '100m':
        case '200m':
        case '400m':
            return 'sprint';
        case '800m':
        case '1500m':
        case '3000m':
            return 'middle';
        case '5000m':
        case '6000m':
        case '8000m':
        case '10000m':
            return 'distance';
        default:
            return undefined;
    }
}

function PlayerCard({
                        player,
                        action,
                        actionLabel,
                        actionColor = 'blue',
                        disabled = false,
                        raceCount,
                        eventType,
                    }: {
    player: Player;
    action: () => void;
    actionLabel: string;
    actionColor?: 'blue' | 'red' | 'green';
    disabled?: boolean;
    raceCount?: number;
    eventType?: 'sprint' | 'middle' | 'distance' | undefined;
}) {
    const colorClasses = {
        blue: 'text-blue-500 hover:text-blue-700',
        red: 'text-red-500 hover:text-red-700',
        green: 'text-green-500 hover:text-green-700',
    };

    return (
        <div className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
            <div className="flex items-center gap-2">
                <div>
                    <span className="font-medium">{player.firstName} {player.lastName}</span>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{getYearText(player.year)}</span>
                        <span>•</span>
                        {eventType === 'sprint' && (
                            <span>Sprint OVR {player.playerRatings.typeRatings.shortDistanceOvr}</span>
                        )}
                        {eventType === 'middle' && (
                            <span>Mid OVR {player.playerRatings.typeRatings.middleDistanceOvr}</span>
                        )}
                        {eventType === 'distance' && (
                            <span>Distance OVR {player.playerRatings.typeRatings.longDistanceOvr}</span>
                        )}
                        {!eventType && (
                            <span>OVR {player.playerRatings.overall}</span>
                        )}
                        {raceCount !== undefined && raceCount > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-blue-500">{raceCount} race{raceCount !== 1 ? 's' : ''}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={action}
                disabled={disabled}
                className={`text-sm ${colorClasses[actionColor]} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {actionLabel}
            </button>
        </div>
    );
}

function MeetSelector({
                          meets,
                          selectedMeetId,
                          onSelect,
                          raceCounts,
                      }: {
    meets: Meet[];
    selectedMeetId: number | null;
    onSelect: (meetId: number) => void;
    raceCounts: Map<number, { total: number; declared: number }>;
}) {
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-3">Upcoming Meets</h2>
            <div className="space-y-2">
                {meets.map((meet) => {
                    const counts = raceCounts.get(meet.meetId);
                    return (
                        <button
                            key={meet.meetId}
                            onClick={() => onSelect(meet.meetId)}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${
                                selectedMeetId === meet.meetId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Week {meet.week}</span>
                                {counts && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        selectedMeetId === meet.meetId
                                            ? 'bg-white/20'
                                            : 'bg-neutral-200 dark:bg-neutral-600'
                                    }`}>
                                        {counts.declared}/{counts.total}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm opacity-80">{meet.type}</div>
                        </button>
                    );
                })}
                {meets.length === 0 && (
                    <p className="text-neutral-500 text-sm">No upcoming meets</p>
                )}
            </div>
        </div>
    );
}

function RaceLineupCard({
                            race,
                            meet,
                            players,
                            teamId,
                            isExpanded,
                            onToggle,
                            onAddPlayer,
                            onRemovePlayer,
                            playerRaceCounts,
                            isUserTeam,
                        }: {
    race: Race;
    meet: Meet;
    players: Player[];
    teamId: number;
    isExpanded: boolean;
    onToggle: () => void;
    onAddPlayer: (playerId: number) => void;
    onRemovePlayer: (playerId: number) => void;
    playerRaceCounts: Map<number, number>;
    isUserTeam: boolean;
}) {
    const lineup = getTeamLineup(race, teamId);

    const lineupPlayers = useMemo(() =>
            lineup.declared
                .map(id => players.find(p => p.playerId === id))
                .filter((p): p is Player => p !== undefined),
        [lineup.declared, players]
    );

    const availablePlayers = useMemo(() =>
            players.filter(p =>
                isPlayerEligibleForRace(p, race, meet) &&
                !lineup.declared.includes(p.playerId)
            ).sort((a, b) => b.playerRatings.overall - a.playerRatings.overall),
        [players, race, meet, lineup.declared]
    );

    const eventType = eventDistanceToString(race.eventType);

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{race.eventType}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                        lineupPlayers.length > 0
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'
                    }`}>
                        {lineupPlayers.length} declared
                    </span>
                    {lineup.locked && (
                        <span
                            className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                            🔒 Locked
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500">
                        {availablePlayers.length} available
                    </span>
                    <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-neutral-200 dark:border-neutral-700">
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-700">
                        <div className="p-4">
                            <h4 className="font-medium mb-3 text-neutral-600 dark:text-neutral-400">
                                Current Lineup
                            </h4>
                            {lineupPlayers.length > 0 ? (
                                <div className="space-y-2">
                                    {lineupPlayers.map((player, idx) => (
                                        <div key={player.playerId} className="flex items-center gap-2">
                                            <span className="text-xs text-neutral-400 w-4">{idx + 1}</span>
                                            <div className="flex-1">
                                                <PlayerCard
                                                    player={player}
                                                    action={() => onRemovePlayer(player.playerId)}
                                                    actionLabel="Remove"
                                                    actionColor="red"
                                                    disabled={lineup.locked || !isUserTeam}
                                                    raceCount={playerRaceCounts.get(player.playerId)}
                                                    eventType={eventType}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-neutral-500 text-sm py-4 text-center">
                                    No players declared yet
                                </p>
                            )}
                        </div>

                        <div className="p-4">
                            <h4 className="font-medium mb-3 text-neutral-600 dark:text-neutral-400">
                                Eligible Players
                            </h4>
                            {availablePlayers.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {availablePlayers.map((player) => (
                                        <PlayerCard
                                            key={player.playerId}
                                            player={player}
                                            action={() => onAddPlayer(player.playerId)}
                                            actionLabel="+ Add"
                                            actionColor="green"
                                            disabled={lineup.locked || !isUserTeam}
                                            raceCount={playerRaceCounts.get(player.playerId)}
                                            eventType={eventType}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-neutral-500 text-sm py-4 text-center">
                                    No eligible players available
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PlayerRaceMatrix({
                              players,
                              races,
                              meet,
                              teamId,
                              onTogglePlayerInRace,
                              isUserTeam,
                          }: {
    players: Player[];
    races: Race[];
    meet: Meet;
    teamId: number;
    onTogglePlayerInRace: (raceId: number, playerId: number, add: boolean) => void;
    isUserTeam: boolean;
}) {
    const playerRaceMap = useMemo(() => {
        const map = new Map<number, { race: Race; isIn: boolean }[]>();

        players.forEach(player => {
            const eligibleRaces = races
                .filter(r => isPlayerEligibleForRace(player, r, meet))
                .map(race => ({
                    race,
                    isIn: getTeamLineup(race, teamId).declared.includes(player.playerId)
                }));
            map.set(player.playerId, eligibleRaces);
        });

        return map;
    }, [players, races, meet, teamId]);

    const sortedPlayers = useMemo(() =>
            [...players].sort((a, b) => {
                const aRaces = playerRaceMap.get(a.playerId)?.filter(r => r.isIn).length || 0;
                const bRaces = playerRaceMap.get(b.playerId)?.filter(r => r.isIn).length || 0;
                if (bRaces !== aRaces) return bRaces - aRaces;
                return b.playerRatings.overall - a.playerRatings.overall;
            }),
        [players, playerRaceMap]
    );

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="font-semibold">Player → Race View</h3>
                <p className="text-sm text-neutral-500">Click race chips to toggle entry</p>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {sortedPlayers.map(player => {
                    const eligibleRaces = playerRaceMap.get(player.playerId) || [];
                    const racesIn = eligibleRaces.filter(r => r.isIn).length;

                    if (eligibleRaces.length === 0) return null;

                    return (
                        <div key={player.playerId} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="font-medium">{player.firstName} {player.lastName}</div>
                                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                                        <span>{getYearText(player.year)}</span>
                                        <span>•</span>
                                        <span>OVR {player.playerRatings.overall}</span>
                                        {racesIn > 0 && (
                                            <>
                                                <span>•</span>
                                                <span
                                                    className="text-green-600">{racesIn} race{racesIn !== 1 ? 's' : ''}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {eligibleRaces.map(({race, isIn}) => {
                                        const lineup = getTeamLineup(race, teamId);
                                        return (
                                            <button
                                                key={race.raceId}
                                                onClick={() => onTogglePlayerInRace(race.raceId, player.playerId, !isIn)}
                                                disabled={lineup.locked || !isUserTeam}
                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                    isIn
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-500'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {race.eventType}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

type ViewMode = 'races' | 'players';

export default function TeamLineupsPage({params}: Readonly<{ params: Promise<{ gameId: string; teamId: string }> }>) {
    const {gameId, teamId} = use(params);
    const teamIdNum = Number(teamId);
    const gameIdNum = Number(gameId);

    // Data state
    const [meets, setMeets] = useState<Meet[]>([]);
    const [races, setRaces] = useState<Race[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [team, setTeam] = useState<Team>();

    const [selectedMeetId, setSelectedMeetId] = useState<number | null>(null);
    const [expandedRaces, setExpandedRaces] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>('races');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isUserTeam = selectedTeamId === teamIdNum;

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const gameData = await loadGameData(gameIdNum);
                setSelectedTeamId(gameData.selectedTeamId);
                const currentWeek = gameData.currentWeek;

                const [teamData, raceData, playerData, meetData] = await Promise.all([
                    loadTeams(gameIdNum),
                    loadRaces(gameIdNum),
                    loadActivePlayers(gameIdNum),
                    loadMeets(gameIdNum)
                ]);

                const selectedTeam = teamData?.find(t => t.teamId === teamIdNum);
                setTeam(selectedTeam);

                const teamPlayers = playerData?.filter((p: Player) => p.teamId === teamIdNum) || [];
                setPlayers(teamPlayers);

                setRaces(raceData || []);

                const filteredMeets = (meetData || [])
                    .filter(m => m.week >= currentWeek)
                    .filter(m => m.teams.some(t => t.teamId === teamIdNum))
                    .sort((a, b) => a.week - b.week);
                setMeets(filteredMeets);

                if (filteredMeets.length > 0) {
                    setSelectedMeetId(filteredMeets[0].meetId);
                    const firstMeetRaces = (raceData || []).filter(r => r.meetId === filteredMeets[0].meetId);
                    setExpandedRaces(new Set(firstMeetRaces.map(r => r.raceId)));
                }
            } catch (e) {
                console.error('Error loading lineup data:', e);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [gameIdNum, teamIdNum]);

    const selectedMeet = useMemo(() =>
            meets.find(m => m.meetId === selectedMeetId),
        [meets, selectedMeetId]
    );

    const meetRaces = useMemo(() =>
            races.filter(r => r.meetId === selectedMeetId),
        [races, selectedMeetId]
    );

    const playerRaceCounts = useMemo(() => {
        const counts = new Map<number, number>();
        meetRaces.forEach(race => {
            const lineup = getTeamLineup(race, teamIdNum);
            lineup.declared.forEach(playerId => {
                counts.set(playerId, (counts.get(playerId) || 0) + 1);
            });
        });
        return counts;
    }, [meetRaces, teamIdNum]);

    const meetRaceCounts = useMemo(() => {
        const counts = new Map<number, { total: number; declared: number }>();
        meets.forEach(meet => {
            const meetRaceList = races.filter(r => r.meetId === meet.meetId);
            const declared = meetRaceList.filter(r =>
                getTeamLineup(r, teamIdNum).declared.length > 0
            ).length;
            counts.set(meet.meetId, {total: meetRaceList.length, declared});
        });
        return counts;
    }, [meets, races, teamIdNum]);

    const handleMeetSelect = useCallback((meetId: number) => {
        setSelectedMeetId(meetId);
        const newMeetRaces = races.filter(r => r.meetId === meetId);
        setExpandedRaces(new Set(newMeetRaces.map(r => r.raceId)));
    }, [races]);

    const toggleRaceExpanded = useCallback((raceId: number) => {
        setExpandedRaces(prev => {
            const next = new Set(prev);
            if (next.has(raceId)) {
                next.delete(raceId);
            } else {
                next.add(raceId);
            }
            return next;
        });
    }, []);

    const handleAddPlayer = useCallback(async (raceId: number, playerId: number) => {
        if (!isUserTeam) {
            alert("You do not control this team's lineups.");
            return;
        }

        setIsSaving(true);
        try {
            const freshRaces = await loadRaces(gameIdNum);
            const race = freshRaces?.find(r => r.raceId === raceId);

            if (!race) {
                console.error('Race not found:', raceId);
                return;
            }

            const currentLineup = getTeamLineup(race, teamIdNum);
            if (currentLineup.locked || currentLineup.declared.includes(playerId)) {
                return;
            }

            const newLineup: TeamLineup = {
                declared: [...currentLineup.declared, playerId],
                locked: false
            };

            const updatedRace = updateRaceLineup(race, teamIdNum, newLineup);

            await saveRace(gameIdNum, updatedRace);

            setRaces(freshRaces.map(r => r.raceId === raceId ? updatedRace : r));

        } catch (e) {
            console.error('Error saving lineup:', e);
            alert('Failed to save lineup. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [isUserTeam, teamIdNum, gameIdNum]);

    const handleRemovePlayer = useCallback(async (raceId: number, playerId: number) => {
        if (!isUserTeam) {
            alert("You do not control this team's lineups.");
            return;
        }

        setIsSaving(true);
        try {
            const freshRaces = await loadRaces(gameIdNum);
            const race = freshRaces?.find(r => r.raceId === raceId);

            if (!race) {
                console.error('Race not found:', raceId);
                return;
            }

            const currentLineup = getTeamLineup(race, teamIdNum);
            if (currentLineup.locked) {
                return;
            }

            const newLineup: TeamLineup = {
                declared: currentLineup.declared.filter(id => id !== playerId),
                locked: false
            };

            const updatedRace = updateRaceLineup(race, teamIdNum, newLineup);

            await saveRace(gameIdNum, updatedRace);

            setRaces(freshRaces.map(r => r.raceId === raceId ? updatedRace : r));

        } catch (e) {
            console.error('Error saving lineup:', e);
            alert('Failed to save lineup. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [isUserTeam, teamIdNum, gameIdNum]);

    const handleTogglePlayerInRace = useCallback(async (raceId: number, playerId: number, add: boolean) => {
        if (add) {
            await handleAddPlayer(raceId, playerId);
        } else {
            await handleRemovePlayer(raceId, playerId);
        }
    }, [handleAddPlayer, handleRemovePlayer]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded"/>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg"/>
                        <div className="lg:col-span-3 space-y-4">
                            <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg"/>
                            <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Race Lineups</h1>
                    <div className="flex items-center gap-2">
                        {team && <p className="text-neutral-500">{team.college} {team.teamName}</p>}
                        {!isUserTeam && (
                            <span
                                className="text-xs px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                                View Only
                            </span>
                        )}
                        {isSaving && (
                            <span
                                className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                Saving...
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('races')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            viewMode === 'races'
                                ? 'bg-white dark:bg-neutral-700 shadow'
                                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                    >
                        By Race
                    </button>
                    <button
                        onClick={() => setViewMode('players')}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            viewMode === 'players'
                                ? 'bg-white dark:bg-neutral-700 shadow'
                                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                    >
                        By Player
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                    <MeetSelector
                        meets={meets}
                        selectedMeetId={selectedMeetId}
                        onSelect={handleMeetSelect}
                        raceCounts={meetRaceCounts}
                    />
                </div>

                <div className="lg:col-span-3 space-y-4">
                    {selectedMeet ? (
                        <>
                            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Week {selectedMeet.week} — {selectedMeet.type}
                                        </h2>
                                        <p className="text-neutral-500">
                                            {selectedMeet.season === 'cross_country' ? 'Cross Country' : 'Track & Field'} • {meetRaces.length} race{meetRaces.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {meetRaces.filter(r => getTeamLineup(r, teamIdNum).declared.length > 0).length}
                                        </div>
                                        <div className="text-xs text-neutral-500">races with entries</div>
                                    </div>
                                </div>
                            </div>

                            {viewMode === 'races' ? (
                                meetRaces.length > 0 ? (
                                    meetRaces.map(race => (
                                        <RaceLineupCard
                                            key={race.raceId}
                                            race={race}
                                            meet={selectedMeet}
                                            players={players}
                                            teamId={teamIdNum}
                                            isExpanded={expandedRaces.has(race.raceId)}
                                            onToggle={() => toggleRaceExpanded(race.raceId)}
                                            onAddPlayer={(playerId) => handleAddPlayer(race.raceId, playerId)}
                                            onRemovePlayer={(playerId) => handleRemovePlayer(race.raceId, playerId)}
                                            playerRaceCounts={playerRaceCounts}
                                            isUserTeam={isUserTeam}
                                        />
                                    ))
                                ) : (
                                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-8 text-center">
                                        <p className="text-neutral-500">No races scheduled for this meet</p>
                                    </div>
                                )
                            ) : (
                                <PlayerRaceMatrix
                                    players={players}
                                    races={meetRaces}
                                    meet={selectedMeet}
                                    teamId={teamIdNum}
                                    onTogglePlayerInRace={handleTogglePlayerInRace}
                                    isUserTeam={isUserTeam}
                                />
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-8 text-center">
                            <p className="text-neutral-500">Select a meet to manage lineups</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}