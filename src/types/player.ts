import { generate } from "facesjs";

export interface PlayerStats {
    playerId: number
    [key: string]: number; // Stats can be added as needed
}

export interface PlayerPersonality {
    playerId: number
    [key: string]: number; // Placeholder for personality traits
}

export interface Player {
    gameId: number;
    playerId: number;
    teamId: number;
    firstName: string;
    lastName: string;
    eventTypes: { cross_country: string[]; track_field: string[] };
    seasons: ('track_field' | 'cross_country')[]; 
    year: number;
    face: ReturnType<typeof generate>; 
}
