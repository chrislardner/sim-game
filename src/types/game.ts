import { Team } from './team';
import { YearlyLeagueSchedule } from './schedule';
import { SeasonGamePhase } from '@/constants/seasons';
import { Conference, School } from './regionals';

export interface Game {
    gamePhase: SeasonGamePhase;
    gameId: number;
    teams: Team[];
    currentYear: number;   // e.g., 2024
    currentWeek: number;     // Tracks the week within the season
    leagueSchedule: YearlyLeagueSchedule;    // Full season schedule
    lastPlayerId: number; // Tracks last assigned player ID in this game
    lastTeamId: number;  // Tracks last assigned team ID in this game
    lastMeetId: number;  // Tracks last assigned meet ID in this game
    lastRaceId: number;  // Tracks last assigned
    remainingTeams: number[]; // TeamIds still in the playoffs
    schools: School[];
    conferences: Conference[];
}