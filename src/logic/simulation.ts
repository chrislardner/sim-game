import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleNewRecruits } from './newYear';
import { createPlayoffMeet } from '@/logic/meetGenerator';
import { seasonPhases } from '@/constants/seasonPhases';
import { Meet } from '@/types/schedule';
import { Team } from '@/types/team';
import { receiveMessageOnPort } from 'worker_threads';

export async function simulateWeek(gameId: number) {
    const game: Game = await loadGameData(gameId);
    const phase = getPhaseByWeek(game.currentWeek);
    game.gamePhase = phase;

    let success = false;

    if (phase === 'regular') {
        success = await simulateRegularSeason(gameId);
    } else if (phase === 'playoffs') {
        success = await simulatePlayoffs(gameId);
    } else if (phase === 'offseason') {
        success = await handleOffseason(gameId);
    }

    await incrementWeek(game);
    saveGameData(game);
}

function getPhaseByWeek(week: number): 'regular' | 'playoffs' | 'offseason' {
    const { regularCrossCountry, crossCountryPlayoffs, offseason, regularTrackField1, trackFieldPlayoffs1, offseason2, regularTrackField2, trackFieldPlayoffs2, offseason3 } = seasonPhases;

    if (week >= regularCrossCountry.startWeek && week <= regularCrossCountry.endWeek) return 'regular';
    if (week >= crossCountryPlayoffs.startWeek && week <= crossCountryPlayoffs.endWeek) return 'playoffs';
    if (week >= offseason.startWeek && week <= offseason.endWeek) return 'offseason';
    if (week >= regularTrackField1.startWeek && week <= regularTrackField1.endWeek) return 'regular';
    if (week >= trackFieldPlayoffs1.startWeek && week <= trackFieldPlayoffs1.endWeek) return 'playoffs';
    if (week >= offseason2.startWeek && week <= offseason2.endWeek) return 'offseason';
    if (week >= regularTrackField2.startWeek && week <= regularTrackField2.endWeek) return 'regular';
    if (week >= trackFieldPlayoffs2.startWeek && week <= trackFieldPlayoffs2.endWeek) return 'playoffs';
    if (week >= offseason3.startWeek && week <= offseason3.endWeek) return 'offseason';

    throw new Error('Invalid week number');
}

async function simulateRegularSeason(gameId: number): Promise<boolean> {
    // logic for regular season
    return true;
}

export async function simulatePlayoffs(gameId: number): Promise<boolean> {
    try {
        const game = await loadGameData(gameId);
        const matches: Meet[] = [];
        game.remainingTeams = shuffleArray(game.remainingTeams); // Ensure remainingTeams is shuffled and correctly typed

        for (let i = 0; i < game.remainingTeams.length; i += 2) {
            const teamPairIds: Number[] = game.remainingTeams.slice(i, i + 2);
            const teamPair: Team[] = game.teams.filter(team => teamPairIds.includes(team.teamId));
            if (teamPair.length < 2) break;
            const meet = createPlayoffMeet(teamPair, game.currentWeek, game.currentYear, game.gameId);
            matches.push(meet);
            for (const team of teamPair) {
                addMeetsToTeam(team, meet);
            }
        }
        game.remainingTeams = determineWinners(matches);
        game.leagueSchedule.meets.push(...matches);
        await saveGameData(game);
        return true;
    } catch (error) {
        console.error("Error loading game data", error);
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
        winners.push(winner.teamId);
    }
    return winners;
}

async function incrementWeek(game: Game): Promise<boolean> {
    try {
        game.currentWeek += 1;
        if (game.currentWeek > 52) {
            game.currentYear += 1;
            game.currentWeek = 1;
            await saveGameData(game);
            await handleNewRecruits(game.gameId);
            console.log("Recruits");
        }
        return true;
    } catch (error) {
        console.error("Error incrementing week", error);
        return false;
    }
}

function addMeetsToTeam(team: Team, match: Meet) {
    if (team.teamSchedule.meets.length == 0) {
        console.error("Team has no meets");
    }

    team.teamSchedule.meets.push(match);
}
async function handleOffseason(gameId: number): Promise<boolean> {
    return true;
}


