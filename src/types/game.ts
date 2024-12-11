import { Team } from './team';
import { YearlyLeagueSchedule } from './schedule';
import { SeasonGamePhase } from '@/constants/seasons';
import { Conference, School } from './regionals';

export interface Game {
    gamePhase: SeasonGamePhase;
    gameId: number;
    teams: Team[];
    currentYear: number;  
    currentWeek: number;     
    leagueSchedule: YearlyLeagueSchedule;    // Full season schedule
    remainingTeams: number[]; // TeamIds still in the playoffs
}

export interface GameSetup {
    conferenceIds: number[];
    numPlayersPerTeam: number;
    schools: School[];
    conferences: Conference[];
}