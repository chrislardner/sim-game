import { Player } from './player';
import { Meet } from './schedule';

export interface Team {
    teamId: number;
    college: string;
    teamName: string;
    gameId: number;
    players: Player[];
    points: number;
    schedule: Meet[]; // Updated to accept objects with week and meets properties
    conference: string;
    region: string;
}
