import { saveGameData, savePlayerData, saveTeamData } from '@/data/storage';
import { generateLeagueSchedule, generateTeamSchedules } from '@/logic/scheduleGenerator';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import { Player } from '@/types/player';
import { getCurrentIDs, getNextPlayerId, getNextTeamId, initializeIDTracker } from '@/data/idTracker';

var gameIdCounter = 0;

export function initializeNewGame(numTeams: number, numPlayersPerTeam: number): Game {
    const gameId = gameIdCounter++;
    const teams: Team[] = [];
    initializeIDTracker(gameId, 0, 0, 0);

    for (let i = 0; i < numTeams; i++) {
        const team = createTeam(gameId);
        teams.push(team);

        for (let j = 0; j < numPlayersPerTeam; j++) {
            const player = createPlayer(gameId, team.teamId);
            team.players.push(player);
        }
    }

    const leagueSchedule = generateLeagueSchedule(teams, 'cross_country');
    const teamSchedules = generateTeamSchedules(leagueSchedule, teams);

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
                meets: teamSchedules.find(s => s.teamId === team.teamId)?.meets || []
            }
        })),
        currentWeek: 0,
        currentYear: 2024,
        gamePhase: 'regular',
        leagueSchedule,
        lastPlayerId,
        lastTeamId,
        lastMeetId
    };

    saveGameData(game);
    return game;
}

function createTeam(gameId: number): Team {
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
        teamSchedule: { teamId: newTeamId, meets: [] },
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
        year: 1,
        firstName: 'FirstName',
        lastName: newPlayerId + "",
        eventType: '',
        seasons: '',
        };

    savePlayerData(gameId, player); // Save player to IndexedDB
    return player;
}

