// src/logic/offseason.ts
import { Team } from '@/types/team';
import { Player } from '@/types/player';
import { Game } from '@/types/game';
import { getNextPlayerId } from '@/data/idTracker';

// Transition to next season: graduating seniors and adding new recruits
export function handleOffseason(game: Game): void {
    const teams: Team[] = game.teams;
    teams.forEach(team => {
        // Remove graduating seniors
        team.players = team.players.filter(player => player.year !== 4);

        // Promote remaining players
        team.players.forEach(player => {
            if (player.year ==3) player.year = 4;
            else if (player.year == 2) player.year = 3;
            else if (player.year == 1) player.year = 2;
        });

        // Add recruits as new freshmen
        const recruits = generateRecruits(game, 5); // Adjust based on recruiting needs
        team.players.push(...recruits);
    });
}

// Generate new recruits
function generateRecruits(game: Game, count: number): Player[] {
    const recruits: Player[] = [];
    for (let i = 0; i < count; i++) {
        recruits.push({
            playerId: getNextPlayerId(game.gameId),
            teamId: 0, // Will be set when assigned to a team
            stats: {}, // Start with default stats
            personality: {},
            year: 1,
            firstName: '',
            lastName: '',
            eventType: '',
            seasons: '',
        });
    }
    return recruits;
}
