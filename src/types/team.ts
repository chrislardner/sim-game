export interface Team {
    teamId: number;
    college: string;
    teamName: string;
    gameId: number;
    players: number[];
    points: number;
    teamSchedule: TeamSchedule;
    conferenceId: number;
    // region: string; // implement later when needed -- need to clean data
    schoolId: number;
    state: string;
    city: string;
    ovr: number;
    sprint_ovr: number;
    middle_ovr: number;
    long_ovr: number;
    xc_ovr: number;
    abbr: string;
    player_control: boolean
}

export interface TeamSchedule {
    teamId: number;
    year: number;                 // Year associated with the league schedule
    meets: number[];            // List of meetIds in which the team participates
}
