import {Game} from "@/types/game";
import {Player} from "@/types/player";
import {Meet, Race, RaceParticipant} from "@/types/schedule";
import {Team} from "@/types/team";

export async function updateTeamAndPlayerPoints(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        const week = game.currentWeek;
        const leagueMeets = game.leagueSchedule.meets
            .map(meetId => meets.find(meet => meet.meetId === meetId))
            .filter(meet => meet && meet.week === week);

        leagueMeets.forEach(meet => {
            if (meet && meet.season === 'cross_country') {
                meet.races.forEach(raceId => {
                    try {
                        const race = races.find(r => r.raceId === raceId);
                        if (race) {
                            handleCrossCountryScoring(race, teams, players, meet);
                        } else {
                            console.error(`Race not found for raceId ${raceId} in meet ${meet.meetId}`);
                        }
                    } catch (error) {
                        console.error(`Error handling cross country scoring for race ${raceId} in meet ${meet.meetId}`, error);
                    }
                });
            } else if (meet && meet.season === 'track_field') {
                meet.races.forEach(raceId => {
                    try {
                        const race = races.find(r => r.raceId === raceId);
                        if (race) {
                            handleTrackFieldScoring(race, teams, meet);
                        } else {
                            console.error(`Race not found for raceId ${raceId} in meet ${meet.meetId}`);
                        }
                    } catch (error) {
                        console.error(`Error handling track and field scoring for race ${raceId} in meet ${meet.meetId}`, error);
                    }
                });
            }
        });
        return Promise.resolve(true);
    } catch (error) {
        console.error("Error updating team and player points", error);
        return Promise.reject(false);
    }
}

export function handleCrossCountryScoring(race: Race, teams: Team[], players: Player[], meet: Meet): void {
    try {
        const teamParticipants: { [teamId: number]: RaceParticipant[] } = {};

        // Group participants by team and take the top 7
        race.participants.forEach((participant: RaceParticipant) => {
            const player = players.find(player => player.playerId == participant.playerId);
            if (!player) {
                console.error("Player not found");
                return;
            }
            const teamId = player.teamId;
            if (teamId) {
                if (!teamParticipants[teamId]) {
                    teamParticipants[teamId] = [];
                }
                teamParticipants[teamId].push(participant);
            }
        });

        // Sort each team's participants and take the top 7
        for (const teamId in teamParticipants) {
            if (teamParticipants[teamId]) {
                teamParticipants[teamId] = teamParticipants[teamId]
                    .toSorted((a, b) => a.playerTime - b.playerTime)
                    .slice(0, 7);
            }
        }

        // Create a combined list of all top 7 participants from each team
        const combinedParticipants = Object.values(teamParticipants).flat();
        combinedParticipants.sort((a, b) => a.playerTime - b.playerTime);

        // Filter out participants from teams with less than 5 racers
        const validParticipants = combinedParticipants.filter(participant => {
            const teamId = players.find(player => player.playerId == participant.playerId)?.teamId;
            if (teamId) {
                return teamParticipants[teamId] && teamParticipants[teamId].length >= 5;
            } else {
                console.error("Team not found");
            }
        });

        // Assign points based on position in the filtered list
        validParticipants.forEach((participant, index) => {
            const points = index + 1; // Position in the race (1st place = 1 point)
            participant.scoring.points = points;
        });

        // Add points to meet teams for teams with at least 5 participants
        const teamPoints: { [teamId: number]: number } = {};

        validParticipants.forEach(participant => {
            const teamId = players.find(player => player.playerId == participant.playerId)?.teamId;
            if (teamId === undefined) {
                console.error("Team not found");
                throw new Error("Team not found");
            }
            teamPoints[teamId] ??= 0;
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
                } else {
                    console.error(`Race team not found for teamId ${teamId}`);
                }
            } else {
                console.error(`Meet team not found for teamId ${teamId}`);
            }
        }

        teams.forEach(team => {
            const meetTeam = meet.teams.find(t => t.teamId === team.teamId);
            if (meetTeam) {
                team.points += meetTeam.points;
            }
        });

    } catch (error) {
        console.error("Error handling cross country scoring", error);
    }
}

export function handleTrackFieldScoring(race: Race, teams: Team[], meet: Meet): void {
    const pointsByPlace = [10, 8, 6, 4, 2, 1]; // Points for 1st through 6th
    const sortedParticipants = race.participants.toSorted((a, b) => a.playerTime - b.playerTime);

    sortedParticipants.forEach((participant, index) => {
        const points = pointsByPlace[index] || 0; // Assign points to the top 6

        // Update participant points
        participant.scoring.points = points;

        const team = teams.find(t => t.players.some(p => p === participant.playerId));
        if (team) {

            const raceTeam = race.teams.find(t => t.teamId === team.teamId);
            const meetTeam = meet.teams.find(t => t.teamId === team.teamId);
            if (meetTeam && raceTeam) {
                meetTeam.points += points;
                raceTeam.points += points;
            }
        }
    });

    // Update team points
    teams.forEach(team => {
        const meetTeam = meet.teams.find(t => t.teamId === team.teamId);
        if (meetTeam) {
            team.points += meetTeam.points;
        }
    });
}
