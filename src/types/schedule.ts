export interface Race {
    eventType: string;       // e.g., "100m", "8k Cross Country"
    heats: Heat[];           // Array of heats for this race
    participants: RaceParticipant[];  // Array of players participating in the race
    raceId: number;
    teams: { teamId: number, points: number }[];
    meetId: number;           // TeamIds participating in the meet
    gameId: number;
    year: number;
}

export interface Heat {
    players: number[]; // stores playerIds in heat
}

export interface Meet {
    week: number;
    year: number;                 // Year associated with the league schedule
    meetId: number;
    date: string;
    teams: { teamId: number, points: number, has_five_racers: boolean }[];           // TeamIds participating in the meet
    races: number[];            // Races held at the meet
    season: 'cross_country' | 'track_field';
    type: 'regular' | 'playoffs' | 'offseason';
    gameId: number;
}

// Schedule for the entire league
export interface YearlyLeagueSchedule {
    year: number;                 // Year associated with the league schedule
    meets: number[];            // Complete list of all meets for the season
}

export interface RaceParticipant {
    playerId: number;
    playerTime: number;
    scoring: {
        points: number;
        team_top_five: boolean;
        team_top_seven: boolean;
    };
}
