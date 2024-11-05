// src/logic/simulation.ts
import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { Meet } from '@/types/schedule';
import { getNextMeetId } from '@/data/idTracker';
import { handleOffseason } from './offseason';

export async function simulateWeek(gameId: number) {
    const game = await loadGameData(gameId);

    // Determine phase based on currentWeek
    const phase = getPhaseByWeek(game.currentWeek);

    // Perform actions based on the current phase
    if (phase === 'regular') {
        simulateRegularSeason(game);
    } else if (phase === 'playoffs') {
        simulatePlayoffs(game);
    } else if (phase === 'offseason') {
        handleOffseason(game);
    }

    // Increment the week
    game.currentWeek = (game.currentWeek + 1) % 52;
    if (game.currentWeek === 0) {
        game.currentYear += 1;
    }

    saveGameData(game);
}

function getPhaseByWeek(week: number): 'regular' | 'playoffs' | 'offseason' {
    if (week >= 0 && week <= 8) return 'regular';
    if (week >= 9 && week <= 11) return 'playoffs';
    if (week >= 12 && week <= 13) return 'offseason';
    if (week >= 14 && week <= 23) return 'regular';
    if (week >= 24 && week <= 26) return 'playoffs';
    if (week >= 27 && week <= 28) return 'offseason';
    if (week >= 29 && week <= 38) return 'regular';
    if (week >= 39 && week <= 41) return 'playoffs';
    if (week >= 42 && week <= 51) return 'offseason';
    throw new Error('Invalid week number');
}

export function simulateRegularSeason(game: Game) {
    if (game.currentWeek <= 12) {
        game.teams.forEach(team => {
            const meet: Meet = {
                week: game.currentWeek,
                meetId: getNextMeetId(game.gameId),
                teams: [game.teams.find(t => t.teamId === team.teamId)!], // Find the actual team object
                date: `Week ${game.currentWeek}`,
                races: [],
                meetType: 'track_field',
            };
            team.schedule.push(meet);
        });
    } else {
        game.gamePhase = 'playoffs';
    }
}

export function simulatePlayoffs(game: Game) {
    const remainingTeams = game.teams.map(team => team.teamId);
    const matches: Meet[] = [];

    for (let i = 0; i < remainingTeams.length; i += 2) {
        const teamPair = remainingTeams.slice(i, i + 2);
        if (teamPair.length < 2) break;

        const meet: Meet = {
            week: game.currentWeek,
            meetId: getNextMeetId(game.gameId),
            teams: teamPair.map(teamId => game.teams.find(team => team.teamId === teamId)!),
            date: `Playoff Round`,
            races: [],
            meetType: 'cross_country',
        };
        matches.push(meet);
    }
}