export interface Team {
    teamId: number;
    college: string;
    teamName: string;
    gameId: number;
    players: number[];
    points: number;
    teamSchedule: TeamSchedule;
    conferenceId: number;
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
    latitude?: number;
    longitude?: number;
    XCPlayers: number;
    XCTFPlayers: number;
    TFPlayers: number;
}

export interface TeamSchedule {
    teamId: number;
    year: number;
    meets: number[];
}
