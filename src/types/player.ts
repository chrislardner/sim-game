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
    recruitId?: number;
    playerPersonality?: PlayerPersonality;
}

export interface Recruit {
    recruitId: number;
    year: number;
    firstName: string;
    lastName: string;
    seasons: ('track_field' | 'cross_country')[];
    eventTypes: { cross_country: string[]; track_field: string[] };
    playerArch: PlayerArch;
    face: ReturnType<typeof generate>;
    playerSubArchetype: SubArchetype;
    races: RecruitRace[];
    recruitPersonality: PlayerPersonality;
    interactions: PlayerInteractions;
}

export interface RecruitRace {
    season: 'track_field' | 'cross_country';
    event: string;
    time: number;
    week: number;
    recruitRaceId: number;
}

export interface PlayerInteractions {
    interactionsWithTeam: Record<number, Interaction[]>;
    moodWithTeam: Record<number, number>;
    probabilityOfJoiningTeam: Record<number, number>;
}

export interface Interaction {
    type: string;
    effect: number;
}

export type Attributes = Record<AttrName, number>;

