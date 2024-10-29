import { Player } from './player';

export interface Team {
    teamId: number;
    college: string;
    teamName: string;
    gameId: number;
    players: Player[];
    points: number;
    schedule: { week: number; meets: number[] }[]; // Updated to accept objects with week and meets properties
    conference: string;
    region: string;
}
