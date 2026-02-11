import {generate} from "facesjs";
import {SubArchetype} from "@/constants/subArchetypes";
import type {AttrName} from "@/constants/curves";

export interface PlayerRatings {
    playerId: number;
    overall: number;
    potential: number;
    injuryResistance: number;
    consistency: number;
    recovery: number;
    typeRatings: TypeRatings
    athleticism: number;
    // Important for Long Distance Runner
    pacing: number;
    stamina: number;
    mentalToughness: number;
    runningEconomy: number;
    terrainAdaptability: number;
    // Important for Middle Distance Runner
    speedEndurance: number;
    speedRecovery: number;
    kickSpeed: number;
    tactics: number;
    // Important for Sprinter
    acceleration: number;
    explosiveness: number;
    topSpeed: number;
    strength: number;
    strideFrequency: number;
    // // Important for Hurdler
    // hurdleClearance: number;
    // hurdleRhythm: number;
    // leadTrailBalance: number;
    // // Important for relays
    // batonExchangeTiming: number;
    // batonExchangePrecision: number;
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

export type Attributes = Record<AttrName, number>;

