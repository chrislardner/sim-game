import { Team } from "@/types/team";

export function calculateTeamOvr(team: Team): number {
    return Math.floor((team.sprint_ovr + team.middle_ovr + team.long_ovr) / 3);
}

export function calculateTeamSprintOvr(team: Team): number {
    return Math.floor((team.ovr + team.sprint_ovr) / 2);
}

export function calculateTeamMiddleOvr(team: Team): number {
    return Math.floor((team.ovr + team.middle_ovr) / 2);
}

export function calculateTeamLongOvr(team: Team): number {
    return Math.floor((team.ovr + team.long_ovr) / 2);
}