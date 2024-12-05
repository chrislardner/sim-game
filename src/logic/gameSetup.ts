import { saveGameData } from '@/data/storage';
import { generateYearlyLeagueSchedule, generateTeamSchedules } from '@/logic/scheduleGenerator';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import { getNextGameId, getCurrentIDs, initializeIDTracker } from '@/data/idTracker';
import { createPlayer } from './generatePlayer';
import { createTeam } from './generateTeam';


export async function initializeNewGame(numTeams: number, numPlayersPerTeam: number): Promise<Game> {
    const gameId = getNextGameId();
    const teams: Team[] = [];
    const currentYear = 2024
    initializeIDTracker(gameId, 0, 0, 0, 0);

    for (let i = 0; i < numTeams; i++) {
        const team: Team = await createTeam(gameId, currentYear);
        teams.push(team);

        for (let j = 0; j < numPlayersPerTeam; j++) {
            const player = await createPlayer(gameId, team.teamId);
            team.players.push(player);
        }
    }

    const leagueSchedule = generateYearlyLeagueSchedule(gameId, teams, currentYear);
    const teamSchedules = generateTeamSchedules(leagueSchedule, teams, currentYear);

    const ids = getCurrentIDs(gameId);

    const lastPlayerId = ids.lastPlayerId;
    const lastTeamId = ids.lastTeamId;
    const lastMeetId = ids.lastMeetId;
    const lastRaceId = ids.lastRaceId;

    const game: Game = {
        gameId,
        teams: teams.map(team => ({
            ...team,
            teamSchedule: {
                teamId: team.teamId,
                year: currentYear,
                meets: teamSchedules.find(s => s.teamId === team.teamId)?.meets || []
            }
        })),
        currentWeek: 1,
        currentYear,
        gamePhase: 'regular',
        leagueSchedule,
        lastPlayerId,
        lastTeamId,
        lastMeetId,
        remainingTeams: teams.map(team => team.teamId),
        lastRaceId
    };

    saveGameData(game);
    return game;
}

export { createPlayer };
