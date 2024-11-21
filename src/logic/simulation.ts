import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleOffseason } from './offseason';
import { createRegularSeasonMeet, createPlayoffMeet } from '@/logic/meetGenerator';
import { seasonPhases } from '@/constants/seasonPhases';
import { Meet } from '@/types/schedule';

export async function simulateWeek(gameId: number) {
    const game = await loadGameData(gameId);
    const phase = getPhaseByWeek(game.currentWeek);
    game.gamePhase = phase;

    if (phase === 'regular') {
        simulateRegularSeason(game);
    } else if (phase === 'playoffs') {
        simulatePlayoffs(game);
    } else if (phase === 'offseason') {
        handleOffseason(game);
    }
    incrementWeek(game);
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

function simulateRegularSeason(game: Game) {
    console.log("");
}

export function simulatePlayoffs(game: Game) {
    const matches = [];
    const week = game.currentWeek;
    const year = game.currentYear;

    // Shuffle remaining teams to ensure random pairing
    const shuffledTeams = shuffleArray(game.remainingTeams);

    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const teamPair = shuffledTeams.slice(i, i + 2);
        if (teamPair.length < 2) break;

        const meet = createPlayoffMeet(teamPair, week, year, game.teams, game.gameId);
        matches.push(meet);
    }

    game.remainingTeams = determineWinners(matches);
    game.leagueSchedule.meets.push(...matches);
}

function shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function determineWinners(matches: Meet[]): number[] {
    const winners: number[] = [];
    for (const meet of matches) {
        const winner = meet.teams[Math.floor(Math.random() * meet.teams.length)].teamId;
        winners.push(winner);
    }
    return winners;
}


function incrementWeek(game: Game) {
    game.currentWeek = (game.currentWeek + 1) % 53;
    if (game.currentWeek === 0) {
        game.currentYear += 1;
        game.currentWeek = 1;
    }
}
