export type Team = {
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
    player_control: boolean;
    XCTFPlayers: number;
    TFPlayers: number;
    latitude?: number;
    longitude?: number;

    profile?: TeamProfile;
};

export interface TeamSchedule {
    teamId: number;
    year: number;
    meets: number[];
}

export type TravelPolicy = {
    homeRange?: number;
    awayRange: number;
    homeRoster?: number;
    awayRoster?: number;
};

export type RecruitProfile = {
    quality: number;
    classSize: number;
    hostPreference: number;
};

export type TeamProfile = {
    xc: {
        travel: TravelPolicy;
    };
    track: {
        travel: TravelPolicy;
    };
    recruit: RecruitProfile;
};
