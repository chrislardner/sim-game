export interface Conference {
    conferenceId: number;
    conferenceName: string;
    teamIds: number[];
    conferenceAbbr: string;
}

export interface School {
    collegeId: number;
    collegeName: string;
    conferenceId: number;
    state: string;
    nickname: string;
    city: string;
    collegeAbbr: string;
    // regionId: number;
}