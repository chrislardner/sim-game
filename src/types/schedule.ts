export interface Race {
    eventType: string;
    heats: Heat[];
    participants: RaceParticipant[];
    raceId: number;
    teams: { teamId: number, points: number }[];
    meetId: number;
    gameId: number;
    year: number;
    openRace?: boolean;
}

export interface Heat {
    players: number[];
}

export interface Meet {
    week: number;
    year: number;
    meetId: number;
    date: string;
    teams: { teamId: number, points: number, has_five_racers: boolean }[];
    races: number[];
    season: 'cross_country' | 'track_field';
    type: 'regular' | 'playoffs' | 'offseason';
    gameId: number;
    hostTeamId?: number;
}

export interface YearlyLeagueSchedule {
    year: number;
    meets: number[];
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
