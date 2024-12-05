import { Player } from './player';
import { TeamSchedule } from './schedule';

export interface Team {
    teamId: number;
    college: string;
    teamName: string;
    gameId: number;
    players: Player[];
    points: number;
    teamSchedule: TeamSchedule;
    conferenceId: number;
    // region: string; // implement later when needed -- need to clean data
    schoolId: number;
    state: string;
    city: string;
}
