import { Game } from '@/types/game';
import { saveGameData, loadGameData } from '@/data/storage';
import { handleNewRecruits, handleNewYearSchedule } from './newYear';
import { createMeet, mapWeekToGamePhase } from '@/logic/meetGenerator';
import { Meet, Race } from '@/types/schedule';
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
    updateTeamAndPlayerPoints(game);
    return true;
}

function createPlayoffMeets(game: Game) {
    try {
        const matches: Meet[] = [];
        game.remainingTeams = shuffleArray(game.remainingTeams); // Shuffle remaining teams

        for (let i = 0; i < game.remainingTeams.length; i += 2) {
            const teamPairIds: number[] = game.remainingTeams.slice(i, i + 2);

            const teamPair: Team[] = game.teams.filter(team => teamPairIds.includes(team.teamId));

            try {
                // Create the playoff meet
                const meet = createMeet(teamPair, game.currentWeek, game.currentYear, game.gameId);
                matches.push(meet);

                // Add the meet to each team's schedule
                for (const team of teamPair) {
                    addMeetsToTeam(team, meet);
                }
            } catch (error) {
                console.error(`Error creating or adding meet for teams ${teamPairIds.join(', ')}`, error);
                return false;
            }
        }
        game.leagueSchedule.meets.push(...matches);
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
                    race.participants.forEach(participant => {
                        if (participant.scoring.team_top_five) {
                            const teamId = getParticipantTeamId(participant.playerId, game);
                            if (teamId !== -1) {
                                if (!teamScores[teamId]) {
                                    teamScores[teamId] = 0;
                                }
                                teamScores[teamId] += participant.scoring.points;
                            }
                        }
                    });
                });

                // Determine the team with the lowest points (winner)
                const minScore = Math.min(...Object.values(teamScores));
                const topTeams: number[] = Object.entries(teamScores)
                    .filter(([, score]) => score === minScore)
                    .map(([teamId]) => Number(teamId));

                if (topTeams.length === 1) {
                    winners.push(topTeams[0]); // Clear winner
                } else if (topTeams.length > 1) {
                    // Randomly select a winner in case of a tie
                    const winner = topTeams[Math.floor(Math.random() * topTeams.length)];
                    winners.push(winner);
                }
            } else if (meet.season === 'track_field') {
                // Track & field scoring
                meet.races.forEach(race => {
                    race.participants.forEach(participant => {
                        const teamId = getParticipantTeamId(participant.playerId, game);
                        if (teamId !== null) {
                            teamScores[teamId] = (teamScores[teamId] || 0) + participant.scoring.points;
                        }
                    });
                });

                // Determine the team with the highest points (winner)
                const maxScore = Math.max(...Object.values(teamScores));
                const topTeams: number[] = Object.entries(teamScores)
                    .filter(([, score]) => score === maxScore)
                    .map(([teamId]) => Number(teamId));

                if (topTeams.length === 1) {
                    winners.push(topTeams[0]); // Clear winner
                } else if (topTeams.length > 1) {
                    // Randomly select a winner in case of a tie
                    const winner = topTeams[Math.floor(Math.random() * topTeams.length)];
                    winners.push(winner);
                }
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
    } catch (error) {
        console.error("Error updating team and player points", error);
    }
}

function handleCrossCountryScoring(race: Race, game: Game, meet: Meet): void {
    try {
        const sortedParticipants = race.participants.sort((a, b) => a.playerTime - b.playerTime);

        sortedParticipants.forEach((participant, index) => {
            try {
                const points = index + 1; // Position in the race (1st place = 1 point)
                participant.scoring.points = points;

                const team = game.teams.find(t => t.players.some(p => p.playerId === participant.playerId));
                if (team) {
                    const player = team.players.find(p => p.playerId === participant.playerId);
                    if (player) {
                        player.stats.points = (player.stats.points || 0) + points;
                    }

                    const meetTeam = meet.teams.find(t => t.teamId === team.teamId);
                    if (meetTeam) {
                        meetTeam.points += points;
                    }
                }
            } catch (error) {
                console.error(`Error processing participant ${participant.playerId}`, error);
            }
        });

        // Mark top five participants for each team
        const teamScores: Record<number, number[]> = {};
        sortedParticipants.forEach(participant => {
            const teamId = getParticipantTeamId(participant.playerId, game);
            if (teamId !== null) {
                if (!teamScores[teamId]) {
                    teamScores[teamId] = [];
                }
                teamScores[teamId].push(participant.playerId);
            }
        });

        Object.keys(teamScores).forEach(teamIdStr => {
            const teamId = parseInt(teamIdStr);
            const topFive = teamScores[teamId].slice(0, 5);
            topFive.forEach(playerId => {
                const participant = race.participants.find(p => p.playerId === playerId);
                if (participant) {
                    participant.scoring.team_top_five = true;
                }
            });
        });
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

            const meetTeam = meet.teams.find(t => t.teamId === team.teamId);
            if (meetTeam) {
                meetTeam.points += points;
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

