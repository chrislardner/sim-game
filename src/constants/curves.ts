export type RoleKey = "sprinter" | "middle" | "long";

export interface AttrParams {
    low: number;
    high: number;
    median: number;
    stdev?: number
}

export interface RoleParams {
    sprinter: AttrParams;
    middle: AttrParams;
    long: AttrParams,
    primary_role: RoleKey | "basic"
}

export const ATTR_NAMES = [
    "injuryResistance", "consistency", "recovery", "athleticism", "strength",
    "acceleration", "explosiveness", "topSpeed", "strideFrequency",
    "speedEndurance", "speedRecovery", "kickSpeed", "tactics",
    "pacing", "stamina", "mentalToughness", "runningEconomy", "terrainAdaptability",
] as const;
export type AttrName = typeof ATTR_NAMES[number];

export const ATTR_PARAMS: Record<AttrName, RoleParams> = {
    injuryResistance: {
        sprinter: {low: 25, high: 75, median: 45},
        middle: {low: 25, high: 75, median: 45},
        long: {low: 25, high: 75, median: 50},
        primary_role: "basic",
    },
    consistency: {
        sprinter: {low: 25, high: 75, median: 45},
        middle: {low: 25, high: 75, median: 45},
        long: {low: 25, high: 75, median: 50},
        primary_role: "basic",
    },
    recovery: {
        sprinter: {low: 25, high: 75, median: 45},
        middle: {low: 25, high: 75, median: 45},
        long: {low: 25, high: 75, median: 50},
        primary_role: "basic",
    },
    athleticism: {
        sprinter: {low: 25, high: 75, median: 55},
        middle: {low: 25, high: 75, median: 50},
        long: {low: 25, high: 70, median: 45},
        primary_role: "basic",
    },
    strength: {
        sprinter: {low: 25, high: 75, median: 45},
        middle: {low: 25, high: 65, median: 30},
        long: {low: 15, high: 55, median: 25},
        primary_role: "basic",
    },
    acceleration: {
        sprinter: {low: 35, high: 75, median: 45},
        middle: {low: 25, high: 65, median: 35},
        long: {low: 25, high: 70, median: 35},
        primary_role: "sprinter",
    },
    explosiveness: {
        sprinter: {low: 35, high: 75, median: 50},
        middle: {low: 10, high: 65, median: 30},
        long: {low: 5, high: 40, median: 25},
        primary_role: "sprinter",
    },
    topSpeed: {
        sprinter: {low: 35, high: 75, median: 55},
        middle: {low: 35, high: 65, median: 45},
        long: {low: 25, high: 55, median: 35},
        primary_role: "sprinter",
    },
    strideFrequency: {
        sprinter: {low: 35, high: 75, median: 50},
        middle: {low: 35, high: 70, median: 45},
        long: {low: 25, high: 40, median: 35},
        primary_role: "sprinter",
    },
    speedEndurance: {
        sprinter: {low: 30, high: 75, median: 30},
        middle: {low: 35, high: 75, median: 55},
        long: {low: 25, high: 65, median: 40},
        primary_role: "middle",
    },
    speedRecovery: {
        sprinter: {low: 20, high: 75, median: 25},
        middle: {low: 35, high: 75, median: 50},
        long: {low: 25, high: 65, median: 40},
        primary_role: "middle",
    },
    kickSpeed: {
        sprinter: {low: 30, high: 65, median: 30},
        middle: {low: 35, high: 75, median: 40},
        long: {low: 25, high: 65, median: 35},
        primary_role: "middle",
    },
    tactics: {
        sprinter: {low: 20, high: 35, median: 25},
        middle: {low: 15, high: 65, median: 35},
        long: {low: 25, high: 75, median: 40},
        primary_role: "middle",
    },
    pacing: {
        sprinter: {low: 20, high: 35, median: 25},
        middle: {low: 15, high: 65, median: 35},
        long: {low: 25, high: 75, median: 45},
        primary_role: "long",
    },
    stamina: {
        sprinter: {low: 20, high: 35, median: 25},
        middle: {low: 15, high: 65, median: 35},
        long: {low: 35, high: 75, median: 60},
        primary_role: "long",
    },
    mentalToughness: {
        sprinter: {low: 20, high: 25, median: 25},
        middle: {low: 15, high: 65, median: 45},
        long: {low: 35, high: 75, median: 55},
        primary_role: "long",
    },
    runningEconomy: {
        sprinter: {low: 20, high: 55, median: 25},
        middle: {low: 15, high: 65, median: 35},
        long: {low: 35, high: 75, median: 50},
        primary_role: "long",
    },
    terrainAdaptability: {
        sprinter: {low: 20, high: 35, median: 25},
        middle: {low: 15, high: 65, median: 25},
        long: {low: 25, high: 75, median: 40},
        primary_role: "long",
    },
}

export const RARITY = [
    {p: 0.005, stdevScale: 0.85, medianShift: +8},
    {p: 0.020, stdevScale: 0.92, medianShift: +4},
    {p: 0.180, stdevScale: 1.00, medianShift: 0},
    {p: 0.445, stdevScale: 1.08, medianShift: -2},
    {p: 0.350, stdevScale: 1.18, medianShift: -5},
] as const;

export const BLENDS = {
    "sprinter": {sprinter: 1, middle: 0, long: 0},
    "middle": {sprinter: 0, middle: 1, long: 0},
    "long": {sprinter: 0, middle: 0, long: 1},
    "sprinter+middle": {sprinter: 0.6, middle: 0.4, long: 0},
    "middle+long": {sprinter: 0, middle: 0.55, long: 0.45},
    "sprinter+long": {sprinter: 0.6, middle: 0, long: 0.4},
    "sprinter+middle+long": {sprinter: 0.4, middle: 0.35, long: 0.25},
} as const;

export const AGE_SETS = {
    sprint: new Set<AttrName>([
        "acceleration", "explosiveness", "topSpeed", "strideFrequency", "strength",
    ]),
    middle: new Set<AttrName>([
        "speedEndurance", "speedRecovery", "kickSpeed", "tactics",
    ]),
    long: new Set<AttrName>([
        "pacing", "stamina", "runningEconomy", "terrainAdaptability", "mentalToughness",
    ]),
    basic: new Set<AttrName>([
        "injuryResistance", "consistency", "recovery", "athleticism",
    ]),
} as const;
