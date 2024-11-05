import { Player } from './player';
import { Team } from './team';

export interface Race {
    eventType: string;        // e.g., "100m", "8k Cross Country"
    heats: Heat[];            // Array of heats for this race
    participants: Player[];  // Array
}

export interface Heat {
    playerTimes: Record<number, number>; // Maps playerId to race time
}

export interface Meet {
    week: number;
    meetId: number;
    date: string;
    teams: Team[];
    races: Race[];
    meetType: 'cross_country' | 'track_field'; 
}

export interface Schedule {
    teamId: number;
    meets: Meet[];
}

export interface PlayoffSchedule {
    round: number;           // Playoff round (1 for first round, etc.)
    matches: Meet[];         // Matches for this round
    remainingTeams: number[]; // IDs of teams still in playoffs
}
