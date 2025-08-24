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
    leagueSchedule: YearlyLeagueSchedule;
    remainingTeams: number[];
    selectedTeamId: number
    conferences: Conference[];
}
