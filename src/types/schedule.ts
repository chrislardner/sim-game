import { Player } from './player';
import { Team } from './team';

export interface Race {
    eventType: string;       // e.g., "100m", "8k Cross Country"
    heats: Heat[];           // Array of heats for this race
    participants: Player[];  // Array of players participating in the race
}

export interface Heat {
    playerTimes: Record<number, number>; // Maps playerId to race time
}

export interface Meet {
    week: number;
    year: number;                 // Year associated with the league schedule
    meetId: number;
    date: string;
    teams: Team[];            // Teams participating in the meet
    races: Race[];            // Races held at the meet
    season: 'cross_country' | 'track_field';
    type: 'regular' | 'playoff';
}

// Schedule for individual teams
export interface TeamSchedule {
    teamId: number;
    year: number;                 // Year associated with the league schedule
    meets: Number[];            // List of meets in which the team participates
}

// Schedule for the entire league
export interface YearlyLeagueSchedule {
    [x: string]: any;
    year: number;                 // Year associated with the league schedule
    meets: Meet[];            // Complete list of all meets for the season
}