import { Team } from '@/types/team';
import { createPlayer } from '@/logic/generatePlayer';
import { Game } from '@/types/game';
import { generateTeamSchedules, generateYearlyLeagueSchedule } from './scheduleGenerator';


// Transition to next season: graduating seniors and adding new recruits
export async function handleNewRecruits(game: Game): Promise<boolean> {
    try {
        const teams: Team[] = game.teams;
        teams.forEach(async team => {
            // Count graduating seniors
            const graduatingSeniors = team.players.filter(player => player.year === 4).length;

            // Remove graduating seniors
            team.players = team.players.filter(player => player.year !== 4);

            // Promote remaining players
            team.players.forEach(player => {
                if (player.year == 3) player.year = 4;
                else if (player.year == 2) player.year = 3;
                else if (player.year == 1) player.year = 2;
            });

            // Add recruits as new freshmen
            for (let i = 0; i < graduatingSeniors; i++) {
                const player = await createPlayer(game.gameId, team.teamId, 1);
                team.players.push(player);
            }
        });
        return true;
    } catch (error) {
        console.error('Error handling offseason:', error);
        return false;
    }
}

export async function handleNewYearSchedule(game: Game): Promise<boolean> {
    try {
        const leagueSchedule = generateYearlyLeagueSchedule(game.gameId, game.teams, game.currentYear);
        const teamSchedules = generateTeamSchedules(leagueSchedule, game.teams, game.currentYear);
        game.leagueSchedule = leagueSchedule;
        
        game.teams = game.teams.map(team => ({
            ...team,
            teamSchedule: {
                teamId: team.teamId,
                year: game.currentYear,
                meets: teamSchedules.find(s => s.teamId === team.teamId)?.meets || []
            }
        }));

        return true;
    } catch (error) {
        console.error('Error handling new year schedule:', error);
        return false;
    }
}

