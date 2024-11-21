import { saveGameData, savePlayerData, saveTeamData } from '@/data/storage';
import { generateYearlyLeagueSchedule, generateTeamSchedules } from '@/logic/scheduleGenerator';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import { Player } from '@/types/player';
import { getCurrentIDs, getNextPlayerId, getNextTeamId, initializeIDTracker } from '@/data/idTracker';

var gameIdCounter = 0;

export function initializeNewGame(numTeams: number, numPlayersPerTeam: number): Game {
    const gameId = gameIdCounter++;
    const teams: Team[] = [];
    const currentYear = 2024
    initializeIDTracker(gameId, 0, 0, 0);

    for (let i = 0; i < numTeams; i++) {
        const team = createTeam(gameId, currentYear);
        teams.push(team);

        for (let j = 0; j < numPlayersPerTeam; j++) {
            const player = createPlayer(gameId, team.teamId);
            team.players.push(player);
        }
    }

    const leagueSchedule = generateYearlyLeagueSchedule(teams, currentYear);
    const teamSchedules = generateTeamSchedules(leagueSchedule, teams, currentYear);

    const ids = getCurrentIDs(gameId);

    const lastPlayerId = ids.lastPlayerId;
    const lastTeamId = ids.lastTeamId;
    const lastMeetId = ids.lastMeetId;

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
        remainingTeams: teams.map(team => team.teamId)
    };

    saveGameData(game);
    return game;
}

function createTeam(gameId: number, year: number): Team {
    const newTeamId: number = getNextTeamId(gameId);
    const colleges = ['Knox College', 'Monmouth College', 'Illinois College',
         'Lake Forest College', 'Grinnell College', 'Cornell College',
          'Ripon College', 'Beloit College', 'Lawrence University', 'St. Norbert College',
           'Carroll University'];
    const regions = ['Midwest Region', 'West Region', 'South Region', 'East Region'];
    const conferences = ['Midwest Conferencee']

    const teamData: Team = {
        teamId: newTeamId,
        college: colleges[newTeamId % colleges.length],
        teamName: `Team ${newTeamId}`,
        gameId,
        players: [],
        points: 0,
        teamSchedule: { teamId: newTeamId, meets: [], year},
        conference: 'Midwest Conference',
        region: 'Midwest Region'
    };
    saveTeamData(gameId, teamData);
    return teamData;
}

function createPlayer(gameId: number, teamId: number) {

    const newPlayerId = getNextPlayerId(gameId);

    const player: Player = {
        playerId: newPlayerId,
        teamId,
        stats: {}, 
        personality: {},
        year: Math.random() < 0.5 ? 1 : (Math.random() < 0.5 ? 2 : (Math.random() < 0.5 ? 3 : 4)),
        firstName: 'FirstName',
        lastName: newPlayerId + "",
        eventType: '',
        seasons: '',
        };

    savePlayerData(gameId, player); // Save player to IndexedDB
    return player;
}

