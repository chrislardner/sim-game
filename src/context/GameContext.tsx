'use client';

import React, {
    createContext,
    useReducer,
    ReactNode,
    Dispatch,
    useEffect,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameState, Athlete, Team, Meet, EventType, Schedule, EventResult, AthleteRaceResult,Event } from '../types';


interface GameContextProps {
    state: GameState;
    dispatch: Dispatch<GameAction>;
}

type GameAction =
    | { type: 'INIT_GAME'; payload: GameState }
    | { type: 'START_NEW_GAME'; payload: number }
    | { type: 'SIMULATE_MEET' }
    | { type: 'ADD_ATHLETE'; payload: Athlete }
    | { type: 'ADVANCE_SEASON' }
    | { type: 'UPDATE_TEAM_STATS'; payload: Team };

const meetEvents: EventType[] = [
    '100m',
    '200m',
    '400m',
    '800m',
    '1600m',
    '3200m',
    '5k',
    '10k',
    '110m Hurdles',
    '400m Hurdles',
];

const initialState: GameState = {
    currentDate: new Date().toISOString(),
    meets: [],
    teams: [],
    athletes: [],
    schedule: [],
    currentWeek: 1,
    gameName: '',
    userTeamId: 0
};

export const GameContext = createContext<{
    state: GameState;
    dispatch: Dispatch<GameAction>;
}>({
    state: initialState,
    dispatch: () => null,
});

const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'INIT_GAME':
            return handleInitGame(state, action.payload);
        case 'ADD_ATHLETE':
            return handleAddAthlete(state, action.payload);
        case 'UPDATE_TEAM_STATS':
            return handleUpdateTeamStats(state, action.payload);
        case 'SIMULATE_MEET':
            return handleSimulateMeet(state);
        case 'START_NEW_GAME':
            return handleStartNewGame(state, action.payload);
        case 'ADVANCE_SEASON':
            return handleAdvanceSeason(state);
        default:
            return state;
    }
};

const handleInitGame = (state: GameState, payload: GameState): GameState => {
    return { ...state, ...payload };
};

const handleAddAthlete = (state: GameState, payload: Athlete): GameState => {
    return { ...state, athletes: [...state.athletes, payload] };
};

const handleUpdateTeamStats = (state: GameState, payload: Team): GameState => {
    return {
        ...state,
        teams: state.teams.map((team) =>
            team.id === payload.id ? payload : team
        ),
    };
};

const handleSimulateMeet = (state: GameState): GameState => {
    const newMeets: Meet[] = [];

    const currentWeekSchedule = state.schedule.find(
        (s) => s.week === state.currentWeek
    );

    if (!currentWeekSchedule) {
        // No schedule for current week
        return state;
    }

    const participatingTeamIds = currentWeekSchedule.participatingTeams;

    const participatingTeams = state.teams.filter((team) =>
        participatingTeamIds.includes(team.id)
    );

    // Create a new meet
    const meet: Meet = {
        id: state.meets.length + 1,
        name: currentWeekSchedule.meetName,
        date: state.currentDate,
        teams: participatingTeams,
        events: [],
        teamResults: [],
    };

    // For each event type
    meetEvents.forEach((eventType) => {
        // Get all athletes from participating teams who are in this event
        const participants = state.athletes.filter(
            (athlete) =>
                athlete.events.includes(eventType) &&
                participatingTeamIds.includes(athlete.teamId)
        );

        if (participants.length < 1) return;

        // Simulate results
        const results = simulateEventResults(participants, eventType);

        // Create event
        const event: Event = {
            id: meet.events.length + 1,
            eventType: eventType,
            participants: participants,
            results: results,
        };

        meet.events.push(event);
    });

    // Calculate team points
    const teamPoints: { [teamId: number]: number } = {};

    meet.events.forEach((event) => {
        event.results.forEach((result) => {
            const athlete = state.athletes.find(
                (a) => a.id === result.athleteId
            );
            if (athlete) {
                const teamId = athlete.teamId;
                if (!teamPoints[teamId]) {
                    teamPoints[teamId] = 0;
                }
                teamPoints[teamId] += result.points;
            }
        });
    });

    // Create teamResults
    meet.teamResults = participatingTeams.map((team) => {
        return {
            teamId: team.id,
            points: teamPoints[team.id] || 0,
            position: 0, // Placeholder, will set later
        };
    });

    // Sort teams by points
    meet.teamResults.sort((a, b) => b.points - a.points);

    // Assign positions
    meet.teamResults.forEach((teamResult, index) => {
        teamResult.position = index + 1;
    });

    newMeets.push(meet);

    // Update athlete stats and team stats
    const { updatedAthletes, updatedTeams } = updateStats(state, newMeets);

    // Advance currentWeek
    const newCurrentWeek = state.currentWeek + 1;

    return {
        ...state,
        athletes: updatedAthletes,
        teams: updatedTeams,
        meets: [...state.meets, ...newMeets],
        currentWeek: newCurrentWeek,
    };
};

const handleStartNewGame = (
    state: GameState,
    numTeams: number
): GameState => {
    const teams: Team[] = [];
    let athletes: Athlete[] = [];

    for (let i = 0; i < numTeams; i++) {
        const teamId = i + 1;
        const teamAthletes = generateAthletes(teamId, 17, [
            ...Array(10).fill('Sprinter'),
            ...Array(5).fill('Distance Runner'),
            ...Array(2).fill('Hurdler'),
        ]);

        athletes = athletes.concat(teamAthletes);

        teams.push({
            id: teamId,
            name: `Team ${teamId}`,
            athletes: teamAthletes,
            stats: {
                competitions: 0,
                wins: 0,
                totalPoints: 0,
                rank: 0,
            },
            isUserTeam: teamId === 1, // First team is the user's team
        });
    }

    const schedule = generateSchedule(numTeams);

    return {
        ...state,
        currentDate: new Date().toISOString(),
        teams,
        athletes,
        meets: [],
        schedule,
        currentWeek: 1,
    };
};

const handleAdvanceSeason = (state: GameState): GameState => {
    let updatedAthletes = state.athletes
        .map((athlete) => {
            let newYear: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' =
                athlete.schoolYear;
            switch (athlete.schoolYear) {
                case 'Freshman':
                    newYear = 'Sophomore';
                    break;
                case 'Sophomore':
                    newYear = 'Junior';
                    break;
                case 'Junior':
                    newYear = 'Senior';
                    break;
                case 'Senior':
                    return null; // Graduate seniors
            }
            // Reset seasonRecords
            return {
                ...athlete,
                schoolYear: newYear,
                stats: {
                    ...athlete.stats,
                    competitions: 0,
                    wins: 0,
                    seasonRecords: {},
                },
            };
        })
        .filter((athlete) => athlete !== null) as Athlete[];

    const newAthletes: Athlete[] = [];
    state.teams.forEach((team) => {
        const numGraduated = team.athletes.filter(
            (a) => a.schoolYear === 'Senior'
        ).length;
        const freshmen = generateAthletes(team.id, numGraduated, [
            'Sprinter',
            'Distance Runner',
            'Hurdler',
        ]);
        newAthletes.push(...freshmen);
    });

    const updatedTeams = state.teams.map((team) => {
        const teamAthletes = updatedAthletes.filter(
            (a) => a.teamId === team.id
        );
        const newTeamAthletes = newAthletes.filter(
            (a) => a.teamId === team.id
        );
        return {
            ...team,
            athletes: [...teamAthletes, ...newTeamAthletes],
            stats: {
                competitions: 0,
                wins: 0,
                totalPoints: 0,
                rank: 0,
            },
        };
    });

    const newSchedule = generateSchedule(state.teams.length);

    return {
        ...state,
        athletes: [...updatedAthletes, ...newAthletes],
        teams: updatedTeams,
        meets: [],
        schedule: newSchedule,
        currentWeek: 1,
    };
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Load game state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            dispatch({ type: 'INIT_GAME', payload: JSON.parse(savedState) });
        }
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('gameState', JSON.stringify(state));
    }, [state]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

// Helper function to simulate Meet results
const simulateEventResults = (
    participants: Athlete[],
    eventType: EventType
): EventResult[] => {
    // Assign random times based on athlete stats
    const results: EventResult[] = participants.map((athlete) => {
        const baseTime = getBaseTimeForEvent(athlete, eventType);
        const timeVariation = Math.random() * 2 - 1; // Random variation between -1 and 1
        const time = baseTime + timeVariation;

        return {
            athleteId: athlete.id,
            id: 0, // Will set later
            time: parseFloat(time.toFixed(2)),
            position: 0, // Initial placeholder
            points: 0, // Initial placeholder
        };
    });

    // Sort results by time
    results.sort((a, b) => a.time - b.time);

    // Assign positions and points
    results.forEach((result, index) => {
        result.position = index + 1;
        result.points = getPointsForPosition(result.position);
        result.id = index + 1;
    });

    return results;
};

// Helper function to get base time for an athlete in an event
const getBaseTimeForEvent = (athlete: Athlete, eventType: EventType): number => {
    // Simple formula: base time decreases with higher speed and endurance
    const speedFactor = (100 - athlete.stats.speed) / 100;
    const enduranceFactor = (100 - athlete.stats.endurance) / 100;

    // Base times for events (in seconds)
    const eventBaseTimes: { [key in EventType]: number } = {
        '100m': 12,
        '200m': 22,
        '400m': 52,
        '800m': 110,
        '1600m': 310,
        '3200m': 600,
        '5k': 960,
        '10k': 1920,
        '110m Hurdles': 15,
        '400m Hurdles': 56,
    };

    const baseTime = eventBaseTimes[eventType];
    return baseTime * (1 + (speedFactor + enduranceFactor) / 2);
};

// Helper function to assign points based on position
const getPointsForPosition = (position: number): number => {
    const pointsTable = [10, 8, 6, 5, 4, 3, 2, 1]; // Points for positions 1-8
    return pointsTable[position - 1] || 0;
};

// Helper function to update stats
const updateStats = (state: GameState, newMeets: Meet[]) => {
    let updatedAthletes = [...state.athletes];
    let updatedTeams = [...state.teams];

    newMeets.forEach((meet) => {
        meet.events.forEach((event) => {
            event.results.forEach((result) => {
                let athlete = updatedAthletes.find(
                    (a) => a.id === result.athleteId
                );
                if (athlete) {
                    // Update athlete stats
                    athlete.stats.competitions += 1;
                    athlete.stats.wins += result.position === 1 ? 1 : 0;

                    // Add race result to athlete's raceResults
                    const raceResult: AthleteRaceResult = {
                        date: meet.date,
                        meetId: meet.id,
                        eventType: event.eventType,
                        time: result.time,
                        position: result.position,
                        points: result.points,
                    };

                    if (!athlete.stats.raceResults) {
                        athlete.stats.raceResults = [];
                    }

                    athlete.stats.raceResults.push(raceResult);

                    // Update personal record
                    const currentPR =
                        athlete.stats.personalRecords[event.eventType];
                    if (
                        currentPR === undefined ||
                        result.time < currentPR
                    ) {
                        athlete.stats.personalRecords[event.eventType] =
                            result.time;
                    }

                    // Update season record
                    const currentSeasonRecord =
                        athlete.stats.seasonRecords[event.eventType];
                    if (
                        currentSeasonRecord === undefined ||
                        result.time < currentSeasonRecord
                    ) {
                        athlete.stats.seasonRecords[event.eventType] =
                            result.time;
                    }

                    // Update team stats
                    const team = updatedTeams.find(
                        (t) => t.id === athlete.teamId
                    );
                    if (team) {
                        team.stats.totalPoints += result.points;
                    }
                }
            });
        });

        // Update team stats for team placements
        meet.teamResults.forEach((teamResult) => {
            const team = updatedTeams.find((t) => t.id === teamResult.teamId);
            if (team) {
                team.stats.competitions += 1;
                if (teamResult.position === 1) {
                    team.stats.wins += 1;
                }
            }
        });
    });

    // Update team rankings
    updatedTeams.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
    updatedTeams.forEach((team, index) => {
        team.stats.rank = index + 1;
    });

    return { updatedAthletes, updatedTeams };
};

// Generate random athletes
const generateAthletes = (
    teamId: number,
    numAthletes: number,
    roles: string[]
): Athlete[] => {
    const athletes: Athlete[] = [];
    for (let i = 0; i < numAthletes; i++) {
        const role = roles[i % roles.length];
        const athlete: Athlete = {
            id: uuidv4(),
            name: `Athlete ${uuidv4().slice(0, 5)}`,
            teamId,
            events: getEventsForRole(role),
            stats: {
                athleteID: i + 1,
                speed: Math.floor(Math.random() * 45) + 45, // 45-99
                endurance: Math.floor(Math.random() * 45) + 45,
                strength: Math.floor(Math.random() * 45) + 45,
                competitions: 0,
                wins: 0,
                raceResults: [],
                personalRecords: {},
                seasonRecords: {},
                // Add other stats if necessary
            },
            schoolYear: getRandomSchoolYear(),
        };
        athletes.push(athlete);
    }
    return athletes;
};

// Helper functions
const getEventsForRole = (role: string): EventType[] => {
    switch (role) {
        case 'Sprinter':
            return ['100m', '200m', '400m'];
        case 'Distance Runner':
            return ['800m', '1600m', '3200m', '5k', '10k'];
        case 'Hurdler':
            return ['110m Hurdles', '400m Hurdles'];
        default:
            return [];
    }
};

const getRandomSchoolYear = (): 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' => {
    const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'] as const;
    return years[Math.floor(Math.random() * years.length)];
};

const generateSchedule = (numTeams: number): Schedule[] => {
    const schedule: Schedule[] = [];
    const totalWeeks = 10;
    for (let week = 1; week <= totalWeeks; week++) {
        schedule.push({
            week,
            meetName: `Week ${week} Meet`,
            participatingTeams: Array.from({ length: numTeams }, (_, i) => i + 1),
            isPlayoff: false,
        });
    }
    schedule.push(
        {
            week: totalWeeks + 1,
            meetName: 'Semi-finals',
            participatingTeams: Array.from(
                { length: Math.ceil(numTeams / 2) },
                (_, i) => i + 1
            ),
            isPlayoff: true,
        },
        {
            week: totalWeeks + 2,
            meetName: 'Finals',
            participatingTeams: Array.from(
                { length: Math.ceil(numTeams / 4) },
                (_, i) => i + 1
            ),
            isPlayoff: true,
        }
    );
    return schedule;
};
