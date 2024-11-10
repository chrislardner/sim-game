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
    conference: string;
    region: string;
}
