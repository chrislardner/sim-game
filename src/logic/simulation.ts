import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleNewRecruits, handleNewYearSchedule } from './newYear';
import { createMeet, mapWeekToGamePhase } from '@/logic/meetGenerator';
import { Meet } from '@/types/schedule';
import { Team } from '@/types/team';
import { SeasonGamePhase } from '@/constants/seasons';
import { generateRaceTime, updatePlayerStats, } from './generateRaceTimes';

export async function simulateWeek(gameId: number) {
    const game: Game = await loadGameData(gameId);
    const phase: SeasonGamePhase = mapWeekToGamePhase(game.currentWeek).type;
    game.gamePhase = phase;

    let success = false;

    if (phase === 'regular') {
        success = await simulateRegularSeason(game);
    } else if (phase === 'playoffs') {
        success = await simulatePlayoffs(game);
    } else if (phase === 'offseason') {
        success = await handleOffseason(game);
    }

    if (!success) {
        console.error("Simulation failed");
        return;
    }

    const incremenetSuccess = await incrementWeek(game);
    if (incremenetSuccess[1]) {
        success = await handleNewRecruits(game);
        success = await handleNewYearSchedule(game);
    }

    if (!success) {
        console.error("Increment week failed");
        return;
    }

    saveGameData(game);
}

async function simulateRegularSeason(game: Game): Promise<boolean> {
    simulateMeetsForWeek(game);
    return true;
}

export async function simulatePlayoffs(game: Game): Promise<boolean> {
    try {
        const matches: Meet[] = [];
        game.remainingTeams = shuffleArray(game.remainingTeams); // Ensure remainingTeams is shuffled and correctly typed

        for (let i = 0; i < game.remainingTeams.length; i += 2) {
            const teamPairIds: number[] = game.remainingTeams.slice(i, i + 2);

            const teamPair: Team[] = game.teams.filter(team => teamPairIds.includes(team.teamId));
            if (teamPair.length < 2) {
                game.remainingTeams = game.teams.map(team => team.teamId)
                return true;
            }
            const meet = createMeet(teamPair, game.currentWeek, game.currentYear, game.gameId);
            matches.push(meet);
            for (const team of teamPair) {
                addMeetsToTeam(team, meet);
            }
        }
        game.remainingTeams = determineRandomWinners(matches);
        game.leagueSchedule.meets.push(...matches);
        return true;
    } catch (error) {
        console.error("Error simulating playoffs", error);
        return false
    }
}

function shuffleArray(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function determineRandomWinners(matches: Meet[]): number[] {
    const winners: number[] = [];
    for (const meet of matches) {
        const winner = meet.teams[Math.floor(Math.random() * meet.teams.length)];
        winners.push(winner.teamId);
    }
    return winners;
}

// returns array of booleans [success, new year]
async function incrementWeek(game: Game): Promise<Array<boolean>> {
    try {
        game.currentWeek += 1;
        if (game.currentWeek > 52) {
            game.currentYear += 1;
            game.currentWeek = 1;
            console.log("New Year!");
            return [true, true]
        }
        return [true, false];
    } catch (error) {
        console.error("Error incrementing week", error);
        return [false, false];
    }
}

function addMeetsToTeam(team: Team, match: Meet) {
    if (team.teamSchedule.meets.length == 0) {
        console.error("Team has no meets");
    }

    team.teamSchedule.meets.push(match.meetId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleOffseason(game: Game): Promise<boolean> {
    return true;
}

function simulateMeetsForWeek(game: Game) {
    // Simulate all meets for the current week
    const week = game.currentWeek;
    const meets = game.leagueSchedule.meets.filter(meet => meet.week === week);
    for (const meet of meets) {
        for (const race of meet.races) {
            console.log("simulating meeet" + meet.meetId + " and race" + race.raceId + " on week" + week);
                for (const participant of race.participants) {
                    const raceTime = generateRaceTime(participant.playerId, race.eventType);
                    const participantIndex = race.participants.findIndex(p => p.playerId === participant.playerId);
                    if (participantIndex !== -1) {
                        race.participants[participantIndex].playerTime = raceTime;
                    } else {
                        console.error(`Participant with ID ${participant.playerId} not found in race`);
                    }

                    updatePlayerStats(game, participant.playerId, race.eventType, raceTime);
                }
        }
    }
}

function calculatePoints(participants: { playerId: number; playerTime: number; points: number }[]): number[] {
    const points = [];
    const maxPoints = 10; // Maximum points for the first place
    const minPoints = 1; // Minimum points for the last place

    for (let i = 0; i < participants.length; i++) {
        const point = Math.max(minPoints, maxPoints - i);
        points.push(point);
    }

    return points;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateTeamAndPlayerPoints(game: Game) {
    for (const meet of game.leagueSchedule.meets) {
        for (const race of meet.races) {
                const participants = race.participants.sort((a, b) => a.playerId - b.playerId);
                const points = calculatePoints(participants);

                for (let i = 0; i < participants.length; i++) {
                    const participant = participants[i];
                    const point = points[i];

                    try {
                        // Update player and team points
                        const team = game.teams.find(t => t.players.some(p => p.playerId === participant.playerId));
                        if (team) {
                            const player = team.players.find(p => p.playerId === participant.playerId);
                            if (player) {
                                team.points = (team.points || 0) + point;
                            } else {
                                console.error(`Player with ID ${participant.playerId} not found in team ${team.teamId}`);
                            }
                        } else {
                            console.error(`Team for player with ID ${participant.playerId} not found`);
                        }
                    } catch (error) {
                        console.error(`Error updating points for participant with ID ${participant.playerId}`, error);
                    }
                }
        }
    }
}

