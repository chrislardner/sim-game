export interface Race {
    eventType: string;       // e.g., "100m", "8k Cross Country"
    heats: Heat[];           // Array of heats for this race
    participants: {playerId: number, playerTime:number,  scoring: {points: number, team_top_five: boolean}}[];  // Array of players participating in the race
    raceId: number;
}

export interface Heat {
    players: number[]; // stores playerIds in heat
}

export interface Meet {
    week: number;
    year: number;                 // Year associated with the league schedule
    meetId: number;
    date: string;
    teams: {teamId: number, points: number}[];           // TeamIds participating in the meet
    races: Race[];            // Races held at the meet
    season: 'cross_country' | 'track_field';
    type: 'regular' | 'playoffs' | 'offseason';
}

// Schedule for individual teams
export interface TeamSchedule {
    teamId: number;
    year: number;                 // Year associated with the league schedule
    meets: number[];            // List of meetIds in which the team participates
}

// Schedule for the entire league
export interface YearlyLeagueSchedule {
    year: number;                 // Year associated with the league schedule
    meets: Meet[];            // Complete list of all meets for the season
}