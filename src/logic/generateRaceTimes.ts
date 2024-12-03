import { Game } from "@/types/game";

function getBaseTimeForEvent(eventType: string): number {
    const baselines = {
        '100m': (minMax['100m'][0] + minMax['100m'][1]) / 2,
        '200m': (minMax['200m'][0] + minMax['200m'][1]) / 2,
        '400m': (minMax['400m'][0] + minMax['400m'][1]) / 2,
        '800m': (minMax['800m'][0] + minMax['800m'][1]) / 2,
        '1,500m': (minMax['1,500m'][0] + minMax['1,500m'][1]) / 2,
        '3,000m': (minMax['3,000m'][0] + minMax['3,000m'][1]) / 2,
        '5,000m': (minMax['5,000m'][0] + minMax['5,000m'][1]) / 2,
        '10,000m': (minMax['10,000m'][0] + minMax['10,000m'][1]) / 2,
        '8,000m': (minMax['8,000m'][0] + minMax['8,000m'][1]) / 2
    };
    return baselines[eventType as keyof typeof baselines] || 0;
}

const variability = {
    '100m': 0.03,
    '200m': 0.04,
    '400m': 0.05,
    '800m': 0.07,
    '1,500m': 0.11,
    '3,000m': 0.14,
    '5,000m': 0.16,
    '10,000m': 0.20,
    '8,000m': 0.18 // Cross country
};

function getEventVariability(eventType: keyof typeof variability): number {
    // Variability increases with event distance
    return variability[eventType] || 0.1;
}
export function generateRaceTime(playerId: Number, eventType: string): number {
    const baseTime = getBaseTimeForEvent(eventType);
    const skillFactor = getPlayerSkill(playerId, eventType) / 10; // Normalize skill (1-10) to 0.1-1.0

    // Normal distribution parameters
    const mean = baseTime * (1 - skillFactor * 0.1); // Faster players skew closer to elite times
    const stdDev = getEventVariability(eventType as keyof typeof variability); // Variability specific to the event

    // Generate a time using normal distribution
    const randomFactor = Math.random(); // Generate a random number between 0 and 1
    const z = Math.sqrt(-2 * Math.log(randomFactor)) * Math.cos(2 * Math.PI * Math.random()); // Standard normal (z-score)
    const raceTime = mean + stdDev * z; // Normal transformation

    // Apply environmental adjustments (e.g., weather, fatigue)
    const environmentalAdjustment = getEnvironmentalFactor(eventType);
    const adjustedTime = raceTime + environmentalAdjustment;

    // Ensure time remains within plausible bounds
    return clampTime(adjustedTime, eventType as keyof typeof minMax);
}

function getPlayerSkill(playerId: Number, eventType: string): number {
    // Example skill fetching logic; replace with actual data logic
    // Skill is a value between 1 (novice) and 10 (elite)
    return Math.floor(Math.random() * 10) + 1;
}

function getEnvironmentalFactor(eventType: string): number {
    // Add small variability based on external factors
    const eventLength = getRaceLength(eventType);
    return (Math.random() - 0.5) * (eventLength / 1000) * 2; // Small adjustment
}

const minMax = {
    '100m': [9.7, 14.5],
    '200m': [19.0, 33.0],
    '400m': [47.0, 70.0],
    '800m': [108.0, 150.0],
    '1,500m': [220.0, 370.0],
    '3,000m': [495.0, 760.0],
    '5,000m': [840.0, 1320.0],
    '10,000m': [1740.0, 2800.0],
    '8,000m': [1380.0, 2100.0]
};

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
        case '1,500m':
            return 1500;
        case '3,000m':
            return 3000;
        case '5,000m':
            return 5000;
        case '8,000m':
            return 8000;
        case '10,000m':
            return 10000;
        default:
            return 0;
    }
}

export function updatePlayerStats(game: Game, playerId: Number, eventType: string, time: number) {
    const player = game.teams.flatMap(team => team.players).find(p => p.playerId === playerId);
    if (player) {
        if (!player.stats[eventType]) {
            player.stats[eventType] = 0;
        }
        player.stats[eventType] += time;
    }
}