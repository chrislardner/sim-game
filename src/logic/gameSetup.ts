import { getNextGameId, initializeGameCounter, initializeIDTracker, saveGame } from '@/data/storage';
import { generateYearlyLeagueSchedule, generateTeamSchedules } from '@/logic/scheduleGenerator';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import { createPlayer } from './generatePlayer';
import { createTeamsForConference } from './generateTeam';
import { getAllColleges, getAllConferences } from '@/data/parseSchools';
import { Conference, School } from '@/types/regionals';

export async function initializeNewGame(conferenceIds: number[], numPlayersPerTeam: number): Promise<Game> {
    const teams: Team[] = [];
    const currentYear = 2024;

    initializeGameCounter();
    const gameId = await getNextGameId();
    initializeIDTracker(gameId);


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

    const leagueSchedule = await generateYearlyLeagueSchedule(gameId, teams, currentYear);
    const teamSchedules = generateTeamSchedules(await leagueSchedule, teams, currentYear);
    
    const game: Game = {
        gameId,
        teams: teams.map(team => ({
            ...team,
            teamSchedule: {
                teamId: team.teamId,
                year: currentYear,
                meets: teamSchedules.find(s => s.teamId === team.teamId)?.meets || []
            }})),
        currentWeek: 1,
        currentYear,
        gamePhase: 'regular',
        leagueSchedule,
        remainingTeams: teams.map(team => team.teamId),
    };

    saveGame(game);

    return game;
}

export async function getAllSchoolsAndConferences(): Promise<{ schools: School[], conferences: Conference[] }> {
    const schools = await getAllColleges();
    const conferences = await getAllConferences();
    return { schools, conferences };
}