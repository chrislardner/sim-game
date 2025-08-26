import {Player} from "@/types/player";
import {Team} from "@/types/team";

export function calculateTeamOvr(team: Team) {
    return Math.round((team.sprint_ovr + team.middle_ovr + team.long_ovr) / 3);
}

export function calculateTeamSprintOvr(players: Player[]) {
    const totalSprintOvr = players.reduce((sum, player) => sum + player.playerRatings.typeRatings.shortDistanceOvr, 0);
    return Math.round(totalSprintOvr / players.length);
}

export function calculateTeamMiddleOvr(players: Player[]) {
    const totalMiddleOvr = players.reduce((sum, player) => sum + player.playerRatings.typeRatings.middleDistanceOvr, 0);
    return Math.round(totalMiddleOvr / players.length);
}

export function calculateTeamLongOvr(players: Player[]) {
    const totalLongOvr = players.reduce((sum, player) => sum + player.playerRatings.typeRatings.longDistanceOvr, 0);
    return Math.round(totalLongOvr / players.length);
}

export function calculateTeamOvrs(team: Team, players: Player[]) {
    const teamPlayers = players.filter(player => player.teamId === team.teamId);
    team.sprint_ovr = calculateTeamSprintOvr(teamPlayers);
    team.middle_ovr = calculateTeamMiddleOvr(teamPlayers);
    team.long_ovr = calculateTeamLongOvr(teamPlayers);
    team.xc_ovr = calculateTeamCrossCountryOvr(teamPlayers);
    team.ovr = calculateTeamOvr(team);
}

export function calculateTeamCrossCountryOvr(players: Player[]) {
    const crossCountryAthletes = players.filter(isCrossCountryParticipant);
    if (crossCountryAthletes.length < 5) {
        return 0;
    }
    const totalCrossCountryOvr = crossCountryAthletes.reduce((sum, player) => sum + player.playerRatings.typeRatings.longDistanceOvr, 0);
    return Math.round(totalCrossCountryOvr / crossCountryAthletes.length);
}

const isCrossCountryParticipant = (player: Player): boolean => {
    return player.seasons.includes('cross_country');
};
