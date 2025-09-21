import type {NavItem} from "@/types/nav";

export const NAV_CONFIG: NavItem[] = [
    { type: "page", label: "Switch Leagues", hrefTemplate: "/games" },
    { type: "page", label: "Dashboard",      hrefTemplate: "/games/{id}" },
    {
        type: "section",
        label: "LEAGUE",
        children: [
            { type: "page", label: "Teams",     hrefTemplate: "/games/{id}/league/teams" },
            // { type: "page", label: "Standings", hrefTemplate: "/games/{id}/standings" },
            { type: "page", label: "Schedule",     hrefTemplate: "/games/{id}/league/schedule" },
            { type: "page", label: "Races",     hrefTemplate: "/games/{id}/league/races" },
        ],
    },
    {
        type: "section",
        label: "TEAM",
        children: [
            { type: "page", label: "Roster", hrefTemplate: "/games/{id}/team/{teamId}" },
            { type: "page", label: "Lineups", hrefTemplate: "/games/{id}/team/{teamId}/lineups" },
        ],
    },
    {
        type: "section",
        label: "PLAYERS",
        children: [
            { type: "page", label: "Player Ratings", hrefTemplate: "/games/{id}/players/ratings" },
        ],
    },
    // {
    //     type: "section",
    //     label: "STATS",
    //     children: [
    //         { type: "page", label: "Player Stats", hrefTemplate: "/games/{id}/stats/playerStats" },
    //     ],
    // },
    // {
    //     type: "section",
    //     label: "TOOLS",
    //     children: [
    //         { type: "page", label: "Settings", hrefTemplate: "/games/{id}/tools/settings" },
    //     ],
    // },
    {
        type: "section",
        label: "Help",
        children: [
            { type: "page", label: "Manual", hrefTemplate: "/help/manual", newTab: true }
        ],
    },
];
