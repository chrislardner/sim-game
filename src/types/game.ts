import {YearlyLeagueSchedule} from './schedule';
import {SeasonGamePhase} from '@/constants/seasons';
import {Conference} from './regionals';

export interface Game {
    gamePhase: SeasonGamePhase;
    gameId: number;
    teams: number[];
    players: number[];
    currentYear: number;
    currentWeek: number;
    leagueSchedule: YearlyLeagueSchedule;    // Full season schedule
    remainingTeams: number[]; // TeamIds still in the playoffs
    selectedTeamId: number
    conferences: Conference[];
}
