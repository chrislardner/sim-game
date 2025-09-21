import type { Team } from "@/types/team";

export function withTeamDefaults(team: Team): Team {
    const t = { ...team };
    t.profile ??= {
        recruit: {
            quality: 50,
            classSize: 3,
            hostPreference: 0.35,
        },
        xc: {
            travel: {
                homeRange: 50,
                awayRange: 500,
                homeRoster: 18,
                awayRoster: 12,
            },
        },
        track: {
            travel: {
                homeRange: 50,
                awayRange: 500,
                homeRoster: 30,
                awayRoster: 24,
            }
        },
    };
    return t;
}
