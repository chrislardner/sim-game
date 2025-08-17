export type ConferenceRow = {
    id: number;
    name: string;
    abbr: string;
    teamsCount: number;
};

export type SchoolRow = {
    id: number;
    name: string;
    nickname: string;
    abbr: string;
    conferenceName: string;
    conferenceAbbr: string;
    city: string;
    state: string;
};
