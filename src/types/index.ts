export interface Athlete {
    schoolYear: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
    id: string;
    name: string;
    teamId: number;
    stats: AthleteStats;
    events: EventType[]; // Ensure events are of type EventType
}

export interface AthleteStats {
    speed: number;
    endurance: number;
    strength: number;
    competitions: number;
    wins: number;
}

export interface Team {
    isUserTeam: boolean;
    id: number;
    name: string;
    athletes: Athlete[];
    stats: TeamStats;
}

export interface TeamStats {
    competitions: number;
    wins: number;
    totalPoints: number;
}

export interface EventResult {
    athleteId: string;
    time: number;
    position: number;
    points: number;
}


export interface GameState {
    currentDate: string; // ISO date string
    teams: Team[];
    athletes: Athlete[];
    events: Event[];
}

export type EventType =
    | '100m'
    | '200m'
    | '400m'
    | '800m'
    | '1600m'
    | '3200m'
    | '5k'
    | '10k'
    | '110m Hurdles'
    | '400m Hurdles';

export interface Event {
    id: number;
    name: string; // e.g., '100m'
    date: string; // ISO date string
    participants: Athlete[];
    results: EventResult[];
}

export interface GameState {
    currentDate: string;
    teams: Team[];
    athletes: Athlete[];
    events: Event[];
    schedule: Schedule[];
    currentWeek: number;
}

export interface Schedule {
    week: number;
    meetName: string;
    participatingTeams: number[]; // Array of team IDs
    isPlayoff: boolean;
}
