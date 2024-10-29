import { Team } from './team';

export interface Race {
    eventType: string;        // e.g., "100m", "8k Cross Country"
    heats: Heat[];            // Array of heats for this race
}

export interface Heat {
    playerTimes: Record<number, number>; // Maps playerId to race time
}

export interface Meet {
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
