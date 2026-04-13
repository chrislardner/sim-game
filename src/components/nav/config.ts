import type {NavItem} from "@/types/nav";

export const NAV_CONFIG: NavItem[] = [
    {type: "page", label: "Switch Leagues", hrefTemplate: "/games"},
    {type: "page", label: "Dashboard", hrefTemplate: "/games/{id}"},
    {
        type: "section",
        label: "LEAGUE",
        children: [
            {type: "page", label: "Teams", hrefTemplate: "/games/{id}/league/teams"},
            {type: "page", label: "Schedule", hrefTemplate: "/games/{id}/league/schedule"},
            {type: "page", label: "Races", hrefTemplate: "/games/{id}/league/races"},
        ],
    },
    {
        type: "section",
        label: "TEAM",
        children: [
            {type: "page", label: "Roster", hrefTemplate: "/games/{id}/team/{teamId}"},
            {type: "page", label: "Team Schedule", hrefTemplate: "/games/{id}/team/{teamId}/schedule"},
            {type: "page", label: "Lineups", hrefTemplate: "/games/{id}/team/{teamId}/lineups"},
            {type: "page", label: "Recruiting", hrefTemplate: "/games/{id}/team/recruiting"},
        ],
    },
    {
        type: "section",
        label: "PLAYERS",
        children: [
            {type: "page", label: "Player Ratings", hrefTemplate: "/games/{id}/players/ratings"},
        ],
    },
    {
        type: "section",
        label: "Help",
        children: [
            {type: "page", label: "Manual", hrefTemplate: "/manual", newTab: true},
        ],
    },
];
