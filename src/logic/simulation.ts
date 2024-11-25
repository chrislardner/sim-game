import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleNewRecruits, handleNewYearSchedule } from './newYear';
import { createMeet, mapWeekToGamePhase } from '@/logic/meetGenerator';
import { Meet } from '@/types/schedule';
import { Team } from '@/types/team';
import { SeasonGamePhase } from '@/constants/seasons';
import { raceTypes } from '@/constants/raceTypes';

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
    if(incremenetSuccess[1]) {
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

function generateRaceTime(playerId: Number, eventType: string): number {
    const baseTime = getBaseTimeForEvent(eventType);
    const playerSkill = getPlayerSkill(playerId, eventType);
    const eventLengthFactor = baseTime / 1000; // Normalize the base time to a factor
    const adjustedRandomFactor = (Math.random() - 0.5) * eventLengthFactor * 0.2; // More randomness for longer events
    let raceTime = baseTime - playerSkill + adjustedRandomFactor;

    // Adjust randomness and skill factors based on race type and length
    const raceLength = getRaceLength(eventType);
    const skillFactor = (10 - playerSkill) * (raceLength / 1000);
    const randomnessFactor = (Math.random() - 0.5) * (raceLength / 1000) * 0.3;

    raceTime = baseTime - skillFactor + randomnessFactor;

    // Ensure race times are within reasonable bounds based on race type and length
    let minTime, maxTime;

    if (raceTypes.cross_country.includes(eventType)) {
        // Cross country races have more variability
        minTime = baseTime * 0.75;
        maxTime = baseTime * 1.25;
    } else if (raceTypes.track_field.includes(eventType)) {
        // Track and field events have less variability
        switch (eventType) {
            case '100m':
                minTime = baseTime * 0.95;
                maxTime = baseTime * 1.05;
                break;
            case '200m':
                minTime = baseTime * 0.93;
                maxTime = baseTime * 1.07;
                break;
            case '400m':
                minTime = baseTime * 0.90;
                maxTime = baseTime * 1.10;
                break;
            case '800m':
                minTime = baseTime * 0.88;
                maxTime = baseTime * 1.12;
                break;
            case '1,500m':
                minTime = baseTime * 0.85;
                maxTime = baseTime * 1.15;
                break;
            case '3,000m':
                minTime = baseTime * 0.83;
                maxTime = baseTime * 1.17;
                break;
            case '5,000m':
                minTime = baseTime * 0.80;
                maxTime = baseTime * 1.20;
                break;
            case '10,000m':
                minTime = baseTime * 0.78;
                maxTime = baseTime * 1.22;
                break;
            default:
                minTime = baseTime * 0.85;
                maxTime = baseTime * 1.15;
                break;
        }
    } else {
        minTime = baseTime * 0.85;
        maxTime = baseTime * 1.15;
    }

    if (raceTime < minTime) {
        raceTime = minTime;
    } else if (raceTime > maxTime) {
        raceTime = maxTime;
    }
    return raceTime;
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
        case '10,000m':
            return 10000;
        default:
            return 0;
    }
}

function getBaseTimeForEvent(eventType: string): number {
    if (raceTypes.cross_country.includes(eventType)) {
        return 1620; // Base time for cross country events in seconds (e.g., 40 minutes)
    } else if (raceTypes.track_field.includes(eventType)) {
        switch (eventType) {
            case '100m':
                return 11; // Base time for 100m in seconds
            case '200m':
                return 20; // Base time for 200m in seconds
            case '400m':
                return 50; // Base time for 400m in seconds
            case '800m':
                return 120; // Base time for 800m in seconds
            case '1,500m':
                return 260; // Base time for 1,500m in seconds
            case '3,000m':
                return 540; // Base time for 3,000m in seconds
            case '5,000m':
                return 960; // Base time for 5,000m in seconds
            case '10,000m':
                return 2100; // Base time for 10,000m in seconds
            default:
                return 0;
        }
    }
    return 0;
}

function getPlayerSkill(playerId: Number, eventType: string): number {
    // Placeholder implementation to get player's skill for the event type
    // This should be replaced with actual logic to fetch player's skill
    return getRandomNumber(); // Random skill factor between 1 and 10
}
function getRandomNumber(): number {
    return Math.floor(Math.random() * 10) + 1;
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

