import { Team } from '@/types/team';
import { createPlayer } from '@/logic/gameSetup';
import { Game } from '@/types/game';
import { loadGameData, saveGameData } from '@/data/storage';


// Transition to next season: graduating seniors and adding new recruits
export async function handleNewRecruits(gameId: number): Promise<boolean> {
    try {
        const game: Game = await loadGameData(gameId);
        const teams: Team[] = game.teams;
        teams.forEach(team => {
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
                team.players.push(createPlayer(game.gameId, team.teamId, 1));
            }
        });
        await saveGameData(game);
        return true;
    } catch (error) {
        console.error('Error handling offseason:', error);
        return false;
    }
}
