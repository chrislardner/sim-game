import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleNewRecruits, handleNewYearSchedule } from './newYear';
import { createMeet, mapWeekToGamePhase } from '@/logic/meetGenerator';
import { Meet } from '@/types/schedule';
import { Team } from '@/types/team';
import { SeasonGamePhase } from '@/constants/seasons';

export async function simulateWeek(gameId: number) {
    const game: Game = await loadGameData(gameId);
    const phase: SeasonGamePhase = mapWeekToGamePhase(game.currentWeek).type;
    game.gamePhase = phase;

    let success = false;

    if (phase === 'regular') {
        success = await simulateRegularSeason(game);
    } else if (phase === 'playoffs') {
        success = await simulatePlayoffs(game);
    } else if (phase === 'offseason') {
        success = await handleOffseason(game);
    }

    if (!success) {
        console.error("Simulation failed");
        return;
    }

    let incremenetSuccess = await incrementWeek(game);
    if (incremenetSuccess[1]) {
        success = await handleNewRecruits(game);
        success = await handleNewYearSchedule(game);
    }

    if (!success) {
        console.error("Increment week failed");
        return;
    }

    saveGameData(game);
}

async function simulateRegularSeason(game: Game): Promise<boolean> {
    simulateMeetsForWeek(game);
    return true;
}

export async function simulatePlayoffs(game: Game): Promise<boolean> {
    try {
        const matches: Meet[] = [];
        game.remainingTeams = shuffleArray(game.remainingTeams); // Ensure remainingTeams is shuffled and correctly typed

        for (let i = 0; i < game.remainingTeams.length; i += 2) {
            const teamPairIds: Number[] = game.remainingTeams.slice(i, i + 2);

            const teamPair: Team[] = game.teams.filter(team => teamPairIds.includes(team.teamId));
            if (teamPair.length < 2) {
                game.remainingTeams = game.teams.map(team => team.teamId)
                return true;
            }
            const meet = createMeet(teamPair, game.currentWeek, game.currentYear, game.gameId);
            matches.push(meet);
            for (const team of teamPair) {
                addMeetsToTeam(team, meet);
            }
        }
        game.remainingTeams = determineWinners(matches);
        game.leagueSchedule.meets.push(...matches);
        return true;
    } catch (error) {
        console.error("Error simulating playoffs", error);
        return false
    }
}

function shuffleArray(array: Number[]): Number[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function determineWinners(matches: Meet[]): Number[] {
    const winners: Number[] = [];
    for (const meet of matches) {
        const winner = meet.teams[Math.floor(Math.random() * meet.teams.length)];
        winners.push(winner);
    }
    return winners;
}

// returns array of booleans [success, new year]
async function incrementWeek(game: Game): Promise<Array<boolean>> {
    try {
        game.currentWeek += 1;
        if (game.currentWeek > 52) {
            game.currentYear += 1;
            game.currentWeek = 1;
            console.log("New Year!");
            return [true, true]
        }
        return [true, false];
    } catch (error) {
        console.error("Error incrementing week", error);
        return [false, false];
    }
}

function addMeetsToTeam(team: Team, match: Meet) {
    if (team.teamSchedule.meets.length == 0) {
        console.error("Team has no meets");
    }

    team.teamSchedule.meets.push(match.meetId);
}

async function handleOffseason(game: Game): Promise<boolean> {
    return true;
}

function simulateMeetsForWeek(game: Game) {
    // Simulate all meets for the current week
    const week = game.currentWeek;
    const meets = game.leagueSchedule.meets.filter(meet => meet.week === week);
    for (const meet of meets) {
        for (const race of meet.races) {
            for (const heat of race.heats) {
                for (const playerId of race.participants) {
                    const raceTime = generateRaceTime(playerId, race.eventType);
                    heat.playerTimes[playerId as number] = raceTime;
                    updatePlayerStats(game, playerId, race.eventType, raceTime);
                }
            }
        }
    }
}

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
function generateRaceTime(playerId: Number, eventType: string): number {
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

function updatePlayerStats(game: Game, playerId: Number, eventType: string, time: number) {
    const player = game.teams.flatMap(team => team.players).find(p => p.playerId === playerId);
    if (player) {
        if (!player.stats[eventType]) {
            player.stats[eventType] = 0;
        }
        player.stats[eventType] += time;
    }
}

