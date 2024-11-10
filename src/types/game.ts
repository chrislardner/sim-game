import { Team } from './team';
import { LeagueSchedule } from './schedule';

export interface Game {
    gamePhase: string;
    gameId: number;
    teams: Team[];
    currentYear: number;   // e.g., 2024
    currentWeek: number;     // Tracks the week within the season
    leagueSchedule: LeagueSchedule;    // Full season schedule
    lastPlayerId: number; // Tracks last assigned player ID in this game
    lastTeamId: number;  // Tracks last assigned team ID in this game
    lastMeetId: number;  // Tracks last assigned meet ID in this game
    // Weeks 0-8: regular (cross country)
    // Weeks 9-11: playoffs
    // Weeks 12-13: offseason/awards/team management
    // weeks 14-23: regular (track and field)
    // Weeks 24-26: playoffs
    // Weeks 27-28: offseason/awards/team management
    // weeks 29-38: regular (track and field)
    // Weeks 39-41: playoffs
    // Weeks 42-51: offseason/awards/team management
}