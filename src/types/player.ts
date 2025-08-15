import {generate} from "facesjs";
import {SubArchetype} from "@/constants/subArchetypes";

// Player Stats
export interface PlayerRatings {
    playerId: number;
    overall: number;
    potential: number;
    injuryResistance: number;
    consistency: number;
    endurance: number;
    typeRatings: TypeRatings
    athleticism: number;

    // Important for Long Distance Runner
    pacing: number;
    stamina: number;
    mentalToughness: number;
    // Important for Middle Distance Runner
    speedStamina: number;
    // Important for Sprinter
    acceleration: number;
    explosiveness: number;
    topSpeed: number;
    strength: number;
    // Important for Hurdler
    // flexibility: number;
    // coordination: number;
    // // Important for Jumper
    // jumping: number;
    // balance: number;
    // // Important for Thrower
    // throwing: number;
    // power: number;
}

export interface TypeRatings {
    longDistanceOvr: number;
    middleDistanceOvr: number;
    shortDistanceOvr: number;
    // hurdlingOvr: number;
}

export interface PlayerPersonality {
    playerId: number;
    discipline: number;
    strategy: number;
    adaptability: number;
    leadership: number;
    teamwork: number;
    experience: number;
    academics: number;
    prestige: number;
    locationPreference: number;
}

export interface PlayerArch {
    isSprinter: boolean;
    isMiddleDistance: boolean;
    isLongDistance: boolean;
}

export interface Player {
    gameId: number;
    playerId: number;
    teamId: number;
    firstName: string;
    lastName: string;
    playerArch: PlayerArch;
    eventTypes: { cross_country: string[]; track_field: string[] };
    seasons: ('track_field' | 'cross_country')[];
    year: number;
    face: ReturnType<typeof generate>;
    playerRatings: PlayerRatings;
    playerSubArchetype: SubArchetype;
    retiredYear: number;
    startYear: number;
    interactions: PlayerInteractions;
}


export interface PlayerInteractions {
    moodWithTeam: { [key: number]: number };
    interactionsWithTeam: { [key: number]: Interaction };
}

export interface Interaction {
    type: string;
    effect: number;
}
