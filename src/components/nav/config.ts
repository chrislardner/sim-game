import type { NavItem } from "@/types/nav";

export const NAV_CONFIG: NavItem[] = [
    { type: "page", label: "Switch Leagues", hrefTemplate: "/leagues" },
    { type: "page", label: "Dashboard",      hrefTemplate: "/games/{id}" },
    {
        type: "section",
        label: "LEAGUE",
        children: [
            { type: "page", label: "Teams",     hrefTemplate: "/games/{id}/teams" },
            { type: "page", label: "Standings", hrefTemplate: "/games/{id}/standings" },
            { type: "page", label: "Meets",     hrefTemplate: "/games/{id}/meets" },
            { type: "page", label: "Races",     hrefTemplate: "/games/{id}/races" },
        ],
    },
    {
        type: "section",
        label: "TEAM",
        children: [
            { type: "page", label: "Roster", hrefTemplate: "/games/{id}/team/roster" },
        ],
    },
    {
        type: "section",
        label: "PLAYERS",
        children: [
            { type: "page", label: "Player Ratings", hrefTemplate: "/games/{id}/players/ratings" },
        ],
    },
    {
        type: "section",
        label: "STATS",
        children: [
            { type: "page", label: "Stats", hrefTemplate: "/games/{id}/stats" },
        ],
    },
    {
        type: "section",
        label: "TOOLS",
        children: [
            { type: "page", label: "Tools", hrefTemplate: "/games/{id}/tools" },
        ],
    },
];
