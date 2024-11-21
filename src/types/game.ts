import { Team } from './team';
import { YearlyLeagueSchedule } from './schedule';

export interface Game {
    gamePhase: 'regular' | 'playoffs' | 'offseason'; // Tracks game state
    gameId: number;
    teams: Team[];
    currentYear: number;   // e.g., 2024
    currentWeek: number;     // Tracks the week within the season
    leagueSchedule: YearlyLeagueSchedule;    // Full season schedule
    lastPlayerId: number; // Tracks last assigned player ID in this game
    lastTeamId: number;  // Tracks last assigned team ID in this game
    lastMeetId: number;  // Tracks last assigned meet ID in this game
    remainingTeams: Team[]; // Teams still in the playoffs
    // Weeks 1-8: regular (cross country)
    // Weeks 9-11: playoffs
    // Weeks 12-13: offseason/awards/team management
    // weeks 14-23: regular (track and field)
    // Weeks 24-26: playoffs
    // Weeks 27-28: offseason/awards/team management
    // weeks 29-38: regular (track and field)
    // Weeks 39-41: playoffs
    // Weeks 42-52: offseason/awards/team management
}