import { saveGameData, savePlayerData, saveTeamData } from '@/data/storage';
import { generateSeasonSchedule } from '@/logic/scheduleGenerator';
import { generateTeamSchedules } from '@/logic/schedule';
import { Team } from '@/types/team';
import { Game } from '@/types/game';
import { Player } from '@/types/player';
import { getNextPlayerId, getNextTeamId, initializeIDTracker } from '@/data/idTracker';

var gameIdCounter = 0;

export function initializeNewGame(numTeams: number, numPlayersPerTeam: number): Game {
    const gameId = gameIdCounter++;
    const teams: Team[] = [];
    initializeIDTracker(gameId, 0, 0, 0);
    const seasonSchedule = generateSeasonSchedule(teams, 'cross_country');
    // generateTeamSchedules(teams); 

    const gameData: Game = {
        gameId,
        teams,
        currentYear: 2024, // Starting season
        currentWeek: 0, // Start at week 0
        schedule: seasonSchedule,
        gamePhase: 'cross_country', // Start with cross country season
        lastPlayerId: 0, // Start ID counters at 0
        lastTeamId: 0,
        lastMeetId: 0
    };

    for (let i = 0; i < numTeams; i++) {
        const team = createTeam(gameId);
        teams.push(team);

        for (let j = 0; j < numPlayersPerTeam; j++) {
            const player = createPlayer(gameId, team.teamId);
            team.players.push(player);
        }
    }

    saveGameData(gameData);
    return gameData;
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
        schedule: [],
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

