import { Team } from '@/types/team';
import { createPlayer } from '@/logic/generatePlayer';
import { Game } from '@/types/game';
import { generateTeamSchedules, generateYearlyLeagueSchedule } from './scheduleGenerator';
import { Player } from '@/types/player';
import { Meet, Race } from '@/types/schedule';
import { assignTeamSchedules } from './gameSetup';
import { saveGame, saveMeets, savePlayers, saveRaces, saveTeams } from '@/data/storage';
import { calculateTeamOvrs } from './calculateTeamOvr';


// Transition to next season: graduating seniors and adding new recruits
export async function handleNewYear(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        for (const team of teams) {
            // Count graduating seniors
            const teamPlayers: Player[] = players.filter((player: Player) => team.players.includes(player.playerId));
            const graduatingSeniors: Player[] = teamPlayers.filter((player: Player) => player.year >= 4);
            // Remove graduating seniors
            const teamNonGraduatingSeniors: Player[] = teamPlayers.filter((player: Player) => player.year !== 4);
            const teamNonGraduatingSeniorsIds: number[] = teamNonGraduatingSeniors.map((player: Player) => player.playerId);

            const teamGraduatedplayers = teamPlayers.filter((player: Player) => player.year === 4);
            teamGraduatedplayers.forEach(async player => {
                player.retiredYear = game.currentYear;
                player.teamId = -1;
            });

            const teamGraduatedplayersSubArchetype = teamGraduatedplayers.map((player: Player) => player.playerSubArchetype);
            team.players = team.players.filter((playerId: number) => teamNonGraduatingSeniorsIds.includes(playerId));

            // Promote remaining players
            teamNonGraduatingSeniors.forEach(player => {
                if (player.year == 3) player.year = 4;
                else if (player.year == 2) player.year = 3;
                else if (player.year == 1) player.year = 2;
            });

            // Add recruits as new freshmen
            for (let i = 0; i < graduatingSeniors.length; i++) {
                const player = await createPlayer(game.gameId, team.teamId, 1, teamGraduatedplayersSubArchetype[i], game.currentYear + 1, game.currentYear);
                team.players.push(player.playerId);
                players.push(player);
            }

            calculateTeamOvrs(team, players);
        };

        try {
            const scheduleObject: { meets: Meet[], races: Race[] } = await generateYearlyLeagueSchedule(game.gameId, teams, players, game.currentYear);
    
            const leagueSchedule = {
                year: game.currentYear,
                meets: scheduleObject.meets.map(meet => meet.meetId)
            };
    
            const teamSchedules = generateTeamSchedules(scheduleObject.meets, teams, game.currentYear);
    
            assignTeamSchedules(teams, teamSchedules);
    
            game.leagueSchedule = leagueSchedule;
    
            meets.push(...scheduleObject.meets);
            races.push(...scheduleObject.races);
    
            await saveGame(game);
            await saveMeets(game.gameId, meets);
            await saveRaces(game.gameId, races);
            await savePlayers(game.gameId, players);
            await saveTeams(game.gameId, teams);
    
        } catch (error) {
            console.error('Error handling new year schedule:', error);
            return false;
        }

        return Promise.resolve(true);
    } catch (error) {
        console.error('Error handling offseason:', error);
        return Promise.reject(false);
    }
}
