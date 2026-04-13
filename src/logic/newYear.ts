import {Team} from '@/types/team';
import {createPlayer} from '@/logic/generatePlayer';
import {Game} from '@/types/game';
import {generateTeamSchedules, generateYearlyLeagueSchedule} from './scheduleGenerator';
import {Player} from '@/types/player';
import {Meet, Race} from '@/types/schedule';
import {assignTeamSchedules} from './gameSetup';
import {saveGame, saveMeets, savePlayers, saveRaces, saveRecruits, saveTeams} from '@/data/storage';
import {calculateTeamOvrs} from './calculateTeamOvr';
import {generateRecruits} from '@/logic/generateRecruits';

export async function handleNewYear(
    game: Game,
    teams: Team[],
    players: Player[],
    meets: Meet[],
    races: Race[],
): Promise<boolean> {
    try {
        for (const team of teams) {
            const teamPlayers: Player[] = players.filter(p => team.players.includes(p.playerId));
            const graduatingSeniors: Player[] = teamPlayers.filter(p => p.year >= 4);

            // Mark seniors as retired
            const teamGraduatedPlayers = teamPlayers.filter(p => p.year === 4);
            for (const player of teamGraduatedPlayers) {
                player.retiredYear = game.currentYear;
            }

            const teamGraduatedPlayersSubArchetype = teamGraduatedPlayers.map(p => p.playerSubArchetype);

            // Promote remaining players
            const teamNonGraduating = teamPlayers.filter(p => p.year !== 4);
            teamNonGraduating.forEach(player => {
                if (player.year === 3) player.year = 4;
                else if (player.year === 2) player.year = 3;
                else if (player.year === 1) player.year = 2;
            });

            // How many freshman slots are already filled by committed recruits?
            // Committed recruits become Players with recruitId set and year === 1.
            // They were added to team.players during recruiting, so they appear in teamPlayers.
            const alreadyCommitted = teamPlayers.filter(
                p => p.recruitId !== undefined && p.year === 1,
            ).length;

            // Only auto-generate players for slots not already filled by recruits
            const slotsToFill = Math.max(0, graduatingSeniors.length - alreadyCommitted);

            for (let i = 0; i < slotsToFill; i++) {
                const subArchetype = teamGraduatedPlayersSubArchetype[i] ?? teamGraduatedPlayersSubArchetype[0];
                const player = await createPlayer(
                    game.gameId,
                    team.teamId,
                    1,
                    subArchetype,
                    game.currentYear + 1,
                );
                team.players.push(player.playerId);
                players.push(player);
            }

            calculateTeamOvrs(team, players);
        }

        // Regenerate the recruit pool for the upcoming year
        try {
            const newRecruits = await generateRecruits(teams.length * 7, game.gameId, game.currentYear + 1);
            game.recruits = newRecruits.map(r => r.recruitId);
            await saveRecruits(game.gameId, newRecruits);
        } catch (error) {
            console.error('Error regenerating recruit pool:', error);
            // Non-fatal: game can continue without a fresh pool
        }

        try {
            const filteredPlayers = players.filter(player => player.retiredYear === 0);
            const scheduleObject: { meets: Meet[]; races: Race[] } =
                await generateYearlyLeagueSchedule(game.gameId, teams, filteredPlayers, game.currentYear);

            const leagueSchedule = {
                year: game.currentYear,
                meets: scheduleObject.meets.map(meet => meet.meetId),
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
            return Promise.reject(error);
        }

        return Promise.resolve(true);
    } catch (error) {
        console.error('Error handling offseason:', error);
        return Promise.reject(error);
    }
}
