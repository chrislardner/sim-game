import { generate } from "facesjs";
import { subArchetype } from "@/constants/subArchetypes"; 

// Player Stats
export interface PlayerRatings {
    playerId: number;
    overall: number;
    potential: number;
    strength: number;
    injuryResistance: number;
    consistency: number;
    athleticism: number;
    endurance: number;
    // Important for Long Distance Runner
    longDistance: number;
    pacing: number;
    // Important for Middle Distance Runner
    middleDistance: number;
    // Important for Sprinter
    sprinting: number;
    acceleration: number;
    explosiveness: number;
    // // Important for Hurdler --  will implement later
    // hurdling: number;
    // flexibility: number;
    // // Important for Jumper
    // jumping: number;
    // balance: number;
    // // Important for Thrower
    // throwing: number;
    // power: number;
}

export interface PlayerPersonality {
    playerId: number;
    discipline: number;
    strategy: number;
    adaptability: number;
    leadership: number;
    teamwork: number;
    experience: number;
    mentalToughness: number;
    academics: number;
    prestige: number;
    locationPreference: number;
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
    playerRatings: PlayerRatings;
    playerSubArchetype: subArchetype;
}
