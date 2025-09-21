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

export type Meet = {
    meetId: number;
    gameId: number;
    year: number;
    week: number;
    date: string;
    season: "cross_country" | "track_field";
    type: string;
    format?: MeetFormat;

    hostTeamId?: number;
    venue?: Venue;

    teams: { teamId: number; points: number; has_five_racers?: boolean }[];
    races: number[];
    lineupsByTeam?: Record<number, TeamLineup>;
    maxDeclared?: number;
};

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

export type TeamLineup = {
    declared: number[];
    travel?: number[];
    locked?: boolean;
};

export type MeetFormat = "invite" | "dual" | "tri" | "championship";

export type Venue = { lat: number; lon: number; name?: string };