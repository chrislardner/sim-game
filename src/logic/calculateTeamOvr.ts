import { Player } from "@/types/player";
import { Team } from "@/types/team";
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
    team.sprint_ovr = calculateTeamSprintOvr(players);
    team.middle_ovr = calculateTeamMiddleOvr(players);
    team.long_ovr = calculateTeamLongOvr(players);
    team.xc_ovr = calculateTeamCrossCountryOvr(players);
    team.ovr = calculateTeamOvr(team);
}

export function calculateTeamCrossCountryOvr(players: Player[]) {
    const crossCountryRunners = players.filter(player => player.seasons.includes('cross_country'));
    if (crossCountryRunners.length < 5) {
        return 0;
    }
    const totalCrossCountryOvr = crossCountryRunners.reduce((sum, player) => sum + player.playerRatings.typeRatings.longDistanceOvr, 0);
    return Math.round(totalCrossCountryOvr / crossCountryRunners.length);
}

