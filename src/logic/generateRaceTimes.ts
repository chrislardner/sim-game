import {Player} from "@/types/player";

export type EventType =
    | "100m"
    | "200m"
    | "400m"
    | "800m"
    | "1500m"
    | "3000m"
    | "5000m"
    | "8000m"
    | "10000m";

type RatingKey =
    | "acceleration"
    | "explosiveness"
    | "topSpeed"
    | "pacing"
    | "stamina"
    | "mentalToughness";

type TypeRatingKey =
    | "shortDistanceOvr"
    | "middleDistanceOvr"
    | "longDistanceOvr";

const MIN_MAX: Record<EventType, [number, number]> = {
    "100m": [9.7, 16.5],
    "200m": [19.0, 42.0],
    "400m": [47.0, 90.0],
    "800m": [108.0, 180.0],
    "1500m": [220.0, 450.0],
    "3000m": [495.0, 960.0],
    "5000m": [840.0, 1320.0],
    "8000m": [1380.0, 2100.0],
    "10000m": [1740.0, 3300.0]
};

const VARIABILITY: Record<EventType, number> = {
    "100m": 0.025,
    "200m": 0.030,
    "400m": 0.035,
    "800m": 0.040,
    "1500m": 0.045,
    "3000m": 0.040,
    "5000m": 0.038,
    "8000m": 0.035,
    "10000m": 0.033
};


interface SkillProfile {
    typeRating: TypeRatingKey;
    attributes: ReadonlyArray<readonly [RatingKey, number]>;
}

const SKILL_PROFILES: Record<EventType, SkillProfile> = {
    "100m": {
        typeRating: "shortDistanceOvr",
        attributes: [
            ["acceleration", 0.25],
            ["explosiveness", 0.40],
            ["topSpeed", 0.35]
        ]
    },
    "200m": {
        typeRating: "shortDistanceOvr",
        attributes: [
            ["acceleration", 0.30],
            ["explosiveness", 0.35],
            ["topSpeed", 0.35]
        ]
    },
    "400m": {
        typeRating: "shortDistanceOvr",
        attributes: [
            ["acceleration", 0.20],
            ["explosiveness", 0.15],
            ["topSpeed", 0.65]
        ]
    },
    "800m": {
        typeRating: "middleDistanceOvr",
        attributes: [
            ["pacing", 0.20],
            ["stamina", 0.40],
            ["mentalToughness", 0.40]
        ]
    },
    "1500m": {
        typeRating: "middleDistanceOvr",
        attributes: [
            ["pacing", 0.25],
            ["stamina", 0.35],
            ["mentalToughness", 0.40]
        ]
    },
    "3000m": {
        typeRating: "longDistanceOvr",
        attributes: [
            ["pacing", 0.30],
            ["stamina", 0.40],
            ["mentalToughness", 0.30]
        ]
    },
    "5000m": {
        typeRating: "longDistanceOvr",
        attributes: [
            ["pacing", 0.30],
            ["stamina", 0.45],
            ["mentalToughness", 0.25]
        ]
    },
    "8000m": {
        typeRating: "longDistanceOvr",
        attributes: [
            ["pacing", 0.30],
            ["stamina", 0.50],
            ["mentalToughness", 0.20]
        ]
    },
    "10000m": {
        typeRating: "longDistanceOvr",
        attributes: [
            ["pacing", 0.30],
            ["stamina", 0.50],
            ["mentalToughness", 0.20]
        ]
    }
};

function gaussianRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

function getPlayerSkill(player: Player, event: EventType): number {
    const profile = SKILL_PROFILES[event];
    const ratings = player.playerRatings;
    let attributeScore = 0;
    for (const [key, weight] of profile.attributes) {
        attributeScore += ratings[key] * weight;
    }
    const typeScore = ratings.typeRatings[profile.typeRating];
    return clamp((attributeScore * 0.5 + typeScore * 0.5) / 100, 0, 1);
}

function getConsistencyFactor(player: Player): number {
    const consistency = clamp(player.playerRatings.consistency / 100, 0, 1);
    return 1 - consistency * 0.75;
}

function mapEvent(event: string): EventType {
    const validEvents: EventType[] = [
        "100m",
        "200m",
        "400m",
        "800m",
        "1500m",
        "3000m",
        "5000m",
        "8000m",
        "10000m"
    ];
    if (validEvents.includes(event as EventType)) {
        return event as EventType;
    }
    throw new Error(`Unsupported event type: ${event}`);
}

export function generateRaceTime(event: string, player: Player): number {
    const mappedEvent = mapEvent(event);
    const [min, max] = MIN_MAX[mappedEvent];
    const baseTime = (min + max) / 2;
    const skill = getPlayerSkill(player, mappedEvent);
    const consistencyFactor = getConsistencyFactor(player);
    const mean = baseTime * (1 - skill * 0.2);
    const stdDev = mean * VARIABILITY[mappedEvent] * consistencyFactor;
    const raceTime = mean + gaussianRandom() * stdDev;
    return clamp(raceTime, min, max);
}
