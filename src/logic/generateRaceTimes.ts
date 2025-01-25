import { Player } from "@/types/player";

const minMax = {
    '100m': [9.7, 14.5],
    '200m': [19.0, 33.0],
    '400m': [47.0, 70.0],
    '800m': [108.0, 150.0],
    '1500m': [220.0, 370.0],
    '3000m': [495.0, 760.0],
    '5000m': [840.0, 1320.0],
    '10000m': [1740.0, 2800.0],
    '8000m': [1380.0, 2100.0]
};

const variability = {
    '100m': 0.03,
    '200m': 0.04,
    '400m': 0.05,
    '800m': 0.07,
    '1500m': 0.11,
    '3000m': 0.14,
    '5000m': 0.16,
    '10000m': 0.20,
    '8000m': 0.18 // Cross country
};

function getBaseTimeForEvent(eventType: string): number {
    const baselines = {
        '100m': (minMax['100m'][0] + minMax['100m'][1]) / 2,
        '200m': (minMax['200m'][0] + minMax['200m'][1]) / 2,
        '400m': (minMax['400m'][0] + minMax['400m'][1]) / 2,
        '800m': (minMax['800m'][0] + minMax['800m'][1]) / 2,
        '1500m': (minMax['1500m'][0] + minMax['1500m'][1]) / 2,
        '3000m': (minMax['3000m'][0] + minMax['3000m'][1]) / 2,
        '5000m': (minMax['5000m'][0] + minMax['5000m'][1]) / 2,
        '10000m': (minMax['10000m'][0] + minMax['10000m'][1]) / 2,
        '8000m': (minMax['8000m'][0] + minMax['8000m'][1]) / 2
    };
    return baselines[eventType as keyof typeof baselines] || 0;
}

function getEventVariability(eventType: keyof typeof variability): number {
    return variability[eventType] || 0.1;
}

export function generateRaceTime(eventType: string, player: Player): number {
    const baseTime = getBaseTimeForEvent(eventType);
    const skillFactor = getPlayerSkill(player, eventType) / 10;

    const mean = baseTime * (1 - skillFactor * 0.2); // Increased skill factor influence
    const stdDev = getEventVariability(eventType as keyof typeof variability);

    const randomFactor1 = Math.random();
    const randomFactor2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(randomFactor1)) * Math.cos(2 * Math.PI * randomFactor2);
    const raceTime = mean + stdDev * z;

    const environmentalAdjustment = getEnvironmentalFactor(eventType);
    const adjustedTime = raceTime + environmentalAdjustment;

    return clampTime(adjustedTime, eventType as keyof typeof minMax);
}

function getPlayerSkill(player: Player, eventType: string): number {
    const { playerRatings } = player;
    const { typeRatings } = playerRatings;
    let skill = 0;

    switch (eventType) {
        case '100m': {
            const attributeSum =
                (playerRatings.acceleration * 0.35) +
                (playerRatings.explosiveness * 0.25) +
                (playerRatings.topSpeed * 0.25) +
                (playerRatings.stamina * 0.05);
            skill = 0.5 * typeRatings.shortDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '200m': {
            const attributeSum =
                (playerRatings.acceleration * 0.3) +
                (playerRatings.explosiveness * 0.25) +
                (playerRatings.topSpeed * 0.3) +
                (playerRatings.stamina * 0.15);
            skill = 0.5 * typeRatings.shortDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '400m': {
            const attributeSum =
                (playerRatings.acceleration * 0.25) +
                (playerRatings.explosiveness * 0.2) +
                (playerRatings.topSpeed * 0.35) +
                (playerRatings.stamina * 0.2);
            skill = 0.5 * typeRatings.shortDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '800m': {
            const attributeSum =
                (playerRatings.pacing * 0.2) +
                (playerRatings.stamina * 0.25) +
                (playerRatings.mentalToughness * 0.25) +
                (playerRatings.endurance * 0.3);
            skill = 0.5 * typeRatings.middleDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '1500m': {
            const attributeSum =
                (playerRatings.pacing * 0.2) +
                (playerRatings.stamina * 0.3) +
                (playerRatings.mentalToughness * 0.25) +
                (playerRatings.endurance * 0.25);
            skill = 0.5 * typeRatings.middleDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '3000m': {
            const attributeSum =
                (playerRatings.pacing * 0.2) +
                (playerRatings.stamina * 0.3) +
                (playerRatings.mentalToughness * 0.25) +
                (playerRatings.endurance * 0.25);
            skill = 0.5 * typeRatings.longDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '5000m': {
            const attributeSum =
                (playerRatings.pacing * 0.2) +
                (playerRatings.stamina * 0.25) +
                (playerRatings.mentalToughness * 0.25) +
                (playerRatings.endurance * 0.3);
            skill = 0.5 * typeRatings.longDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '8000m': {
            const attributeSum =
                (playerRatings.pacing * 0.25) +
                (playerRatings.stamina * 0.25) +
                (playerRatings.mentalToughness * 0.25) +
                (playerRatings.endurance * 0.25);
            skill = 0.5 * typeRatings.longDistanceOvr + 0.5 * attributeSum;
            break;
        }
        case '10000m': {
            const attributeSum =
                (playerRatings.pacing * 0.2) +
                (playerRatings.stamina * 0.25) +
                (playerRatings.mentalToughness * 0.25) +
                (playerRatings.endurance * 0.3);
            skill = 0.5 * typeRatings.longDistanceOvr + 0.5 * attributeSum;
            break;
        }
        default:
            skill = 1;
    }

    // Add a small random factor
    skill *= (0.9 + 0.1 * Math.random());

    // Clamp to 1–100, then scale to 1–10
    skill = Math.max(1, Math.min(100, skill)) / 10;
    skill = Math.max(1, Math.min(10, skill));

    return skill;
}

export function generateRaceTimes(player: Player): { [eventType: string]: number } {
    const events = Object.keys(minMax);
    const raceTimes: { [eventType: string]: number } = {};

    events.forEach(eventType => {
        raceTimes[eventType] = generateRaceTime(eventType, player);
    });

    return raceTimes;
}

function getEnvironmentalFactor(eventType: string): number {
    const eventLength = getRaceLength(eventType);
    return (Math.random() - 0.5) * (eventLength / 1000) * 2;
}

function clampTime(time: number, eventType: keyof typeof minMax): number {
    const [min, max] = minMax[eventType] || [0, Infinity];
    return Math.max(min, Math.min(time, max));
}

function getRaceLength(eventType: string): number {
    switch (eventType) {
        case '100m':
            return 100;
        case '200m':
            return 200;
        case '400m':
            return 400;
        case '800m':
            return 800;
        case '1500m':
            return 1500;
        case '3000m':
            return 3000;
        case '5000m':
            return 5000;
        case '8000m':
            return 8000;
        case '10000m':
            return 10000;
        default:
            return 0;
    }
}
