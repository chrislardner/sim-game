import { saveGameData } from '@/data/storage';
import { generateYearlyLeagueSchedule, generateTeamSchedules } from '@/logic/scheduleGenerator';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import { getNextGameId, getCurrentIDs, initializeIDTracker } from '@/data/idTracker';
import { createPlayer } from './generatePlayer';
import { createTeamsForConference } from './generateTeam';
import { getAllColleges, getAllConferences } from '@/data/parseSchools';
import { Conference, School } from '@/types/regionals';

export async function initializeNewGame(conferenceIds: number[], numPlayersPerTeam: number, schools: School[], conferences: Conference[]): Promise<Game> {
    const gameId = getNextGameId();
    const teams: Team[] = [];
    const currentYear = 2024
    initializeIDTracker(gameId, 0, 0, 0, 0);

    console.log(conferenceIds);

    for (let i = 0; i < conferenceIds.length; i++) {
        const conferenceTeams = await createTeamsForConference(gameId, currentYear, conferenceIds[i]);
        for (const team of conferenceTeams) {
            for (let j = 0; j < numPlayersPerTeam; j++) {
                const player = await createPlayer(gameId, team.teamId);
                team.players.push(player);
            }
        }
        teams.push(...conferenceTeams);
    }
    console.log(teams, "teams created");

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
        lastRaceId,
        schools,
        conferences
    };

    saveGameData(game);
    return game;
}

export async function getAllSchoolsAndConferences(): Promise<{ schools: School[], conferences: Conference[] }> {
    const schools = await getAllColleges();
    const conferences = await getAllConferences();
    return { schools, conferences };
}