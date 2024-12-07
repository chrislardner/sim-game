import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleNewRecruits, handleNewYearSchedule } from './newYear';
import { mapWeekToGamePhase } from '@/logic/meetGenerator';
import { Meet, Race, RaceParticipant } from '@/types/schedule';
import { Team } from '@/types/team';
import { SeasonGamePhase } from '@/constants/seasons';
import { generateRaceTime, updatePlayerStats, } from './generateRaceTimes';
import { createMeetsForWeek } from './scheduleGenerator';

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
    updateTeamAndPlayerPoints(game);
    return true;
}

function createPlayoffMeets(game: Game) {
    try {
        let matches: Meet[] = [];
        game.remainingTeams = shuffleArray(game.remainingTeams); // Shuffle remaining teams
        const remainingTeams = game.teams.filter(team => game.remainingTeams.includes(team.teamId));

        matches = createMeetsForWeek(game.gameId, remainingTeams, game.currentWeek, game.currentYear);

        game.leagueSchedule.meets.push(...matches);
        for (const team of remainingTeams) {
            const match = matches.find(match => match.teams.some(t => t.teamId === team.teamId));
            if (match) {
                addMeetsToTeam(team, match);
            } else {
                console.error(`No match found for team ${team.teamId}`);
            }
        }

        return true;
    }
    catch (error) {
        console.error("Error creating playoff meets", error);
        return false;
    }

}

export async function simulatePlayoffs(game: Game): Promise<boolean> {
    try {
        createPlayoffMeets(game);
        simulateMeetsForWeek(game);
        updateTeamAndPlayerPoints(game);

        const matches = game.leagueSchedule.meets.filter(meet => meet.week === game.currentWeek);

        game.remainingTeams = await determineWinnersByPoints(matches, game);

        // Check if the playoffs are over
        if (game.remainingTeams.length === 1) {
            console.log(`Champion determined: Team ${game.remainingTeams[0]}`);
            return true; // Playoffs are complete
        }

        if (game.remainingTeams[0] && game.remainingTeams.length > 0) {
            return true; // Playoffs continue
        }

        console.log("game.remainingTeams is undefined");
        return false;
    } catch (error) {
        console.error("Error simulating playoffs", error);
        return false;
    }
}

export async function determineWinnersByPoints(matches: Meet[], game: Game): Promise<number[]> {
    const winners: number[] = [];

    try {
        for (const meet of matches) {
            const teamScores: { [teamId: number]: number } = {};

            if (meet.season === 'cross_country') {
                // Cross-country scoring
                meet.races.forEach(race => {
                    race.teams.forEach(team => {
                        if (team.points > 0) {
                            teamScores[team.teamId] = (teamScores[team.teamId] || 0) + team.points;
                        }
                    });
                });

                const sortedTeams = Object.entries(teamScores).sort(([, a], [, b]) => a - b);
                const numberOfTeamsToPush = Math.max(Math.ceil(sortedTeams.length * 0.25), 2);
                const teamsToPush = sortedTeams.slice(0, numberOfTeamsToPush).map(([teamId]) => Number(teamId));

                winners.push(...teamsToPush);

            } else if (meet.season === 'track_field') {
                // Track & field scoring
                meet.races.forEach(race => {
                    race.teams.forEach(team => {
                        if (team.points > 0) {
                            teamScores[team.teamId] = (teamScores[team.teamId] || 0) + team.points;
                        }
                    });
                });

                const sortedTeams = Object.entries(teamScores).sort(([, a], [, b]) => b - a);
                const numberOfTeamsToPush = Math.max(Math.ceil(sortedTeams.length * 0.25), 2);
                const teamsToPush = sortedTeams.slice(0, numberOfTeamsToPush).map(([teamId]) => Number(teamId));

                winners.push(...teamsToPush);
            }
        }
    } catch (error) {
        console.error("Error determining winners by points", error);
        return Promise.reject(error);
    }

    return Promise.resolve(winners);
}

function shuffleArray(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    game.remainingTeams = game.teams.map(team => team.teamId); // Reset for the next season
    return true;
}

function simulateMeetsForWeek(game: Game) {
    // Simulate all meets for the current week
    const week = game.currentWeek;
    const meets = game.leagueSchedule.meets.filter(meet => meet.week === week);
    for (const meet of meets) {
        for (const race of meet.races) {
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

function updateTeamAndPlayerPoints(game: Game): void {
    try {
        const week = game.currentWeek;
        const meets = game.leagueSchedule.meets.filter(meet => meet.week === week);

        meets.forEach(meet => {
            if (meet.season === 'cross_country') {
                meet.races.forEach(race => {
                    try {
                        handleCrossCountryScoring(race, game, meet);
                    } catch (error) {
                        console.error(`Error handling cross country scoring for race ${race.raceId} in meet ${meet.meetId}`, error);
                    }
                });
            } else if (meet.season === 'track_field') {
                meet.races.forEach(race => {
                    try {
                        handleTrackFieldScoring(race, game, meet);
                    } catch (error) {
                        console.error(`Error handling track and field scoring for race ${race.raceId} in meet ${meet.meetId}`, error);
                    }
                });
            }
        });
    }
    catch (error) {
        console.error("Error updating team and player points", error);
    }
}

function handleCrossCountryScoring(race: Race, game: Game, meet: Meet): void {
    try {
        const teamParticipants: { [teamId: number]: RaceParticipant[] } = {};

        // Group participants by team and take top 7
        race.participants.forEach(participant => {
            const teamId = getParticipantTeamId(participant.playerId, game);
            if (teamId !== -1) {
                if (!teamParticipants[teamId]) {
                    teamParticipants[teamId] = [];
                }
                teamParticipants[teamId].push(participant);
            }
        });

        // Sort each team's participants and take top 7
        for (const teamId in teamParticipants) {
            teamParticipants[teamId] = teamParticipants[teamId]
                .sort((a, b) => a.playerTime - b.playerTime)
                .slice(0, 7);
        }

        // Create a combined list of all top 7 participants from each team
        const combinedParticipants = Object.values(teamParticipants).flat();
        combinedParticipants.sort((a, b) => a.playerTime - b.playerTime);

        // Filter out participants from teams with less than 5 racers
        const validParticipants = combinedParticipants.filter(participant => {
            const teamId = getParticipantTeamId(participant.playerId, game);
            return teamParticipants[teamId] && teamParticipants[teamId].length >= 5;
        });

        // Assign points based on position in the filtered list
        validParticipants.forEach((participant, index) => {
            const points = index + 1; // Position in the race (1st place = 1 point)
            participant.scoring.points = points;
        });

        // Add points to meet teams for teams with at least 5 participants
        const teamPoints: { [teamId: number]: number } = {};

        validParticipants.forEach(participant => {
            const teamId = getParticipantTeamId(participant.playerId, game);
            if (!teamPoints[teamId] || teamId === -1) {
                teamPoints[teamId] = 0;
            }
            if (teamParticipants[teamId].indexOf(participant) < 5) {
                participant.scoring.team_top_five = true;
                participant.scoring.team_top_seven = true;

                teamPoints[teamId] += participant.scoring.points;
            } else if (teamParticipants[teamId].indexOf(participant) < 7) {
                participant.scoring.team_top_seven = true;
            }
        });
        for (const teamId in teamPoints) {
            const meetTeam = meet.teams.find(t => t.teamId === Number(teamId));
            if (meetTeam) {
                meetTeam.has_five_racers = true;
                meetTeam.points = teamPoints[teamId];
                const raceTeam = race.teams.find(t => t.teamId === Number(teamId));
                if (raceTeam) {
                    raceTeam.points = teamPoints[teamId];
                    console.log(raceTeam.points, "points");
                } else {
                    console.error(`Race team not found for teamId ${teamId}`);
                }
            } else {
                console.error(`Meet team not found for teamId ${teamId}`);
            }
        }

    } catch (error) {
        console.error("Error handling cross country scoring", error);
    }
}

function handleTrackFieldScoring(race: Race, game: Game, meet: Meet): void {
    const pointsByPlace = [10, 8, 6, 4, 2, 1]; // Points for 1st through 6th
    const sortedParticipants = race.participants.sort((a, b) => a.playerTime - b.playerTime);

    sortedParticipants.forEach((participant, index) => {
        const points = pointsByPlace[index] || 0; // Assign points to top 6

        // Update participant points
        participant.scoring.points = points;

        const team = game.teams.find(t => t.players.some(p => p.playerId === participant.playerId));
        if (team) {
            const player = team.players.find(p => p.playerId === participant.playerId);
            if (player) {
                player.stats.points = (player.stats.points || 0) + points;
            }
            const raceTeam = race.teams.find(t => t.teamId === team.teamId);
            const meetTeam = meet.teams.find(t => t.teamId === team.teamId);
            if (meetTeam && raceTeam) {
                meetTeam.points += points;
                raceTeam.points += points;
            }
        }
    });
}

function getParticipantTeamId(playerId: number, game: Game): number {
    try {
        for (const team of game.teams) {
            if (team.players.some(player => player.playerId === playerId)) {
                return team.teamId;
            }
        }
    } catch (error) {
        console.error(`Error getting participant team ID for player ${playerId}`, error);
        return -1;
    }
    return -1;
}

