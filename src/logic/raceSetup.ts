import { Race, Heat } from '@/types/event';
import { Player } from '@/types/player';

// Assign players to races and create heats as needed
export function organizeRacesForMeet(race: Race, players: Player[]): void {
    const eligiblePlayers = players.filter(player => 
        race.eventType === 'mid-distance' ? player.eventType === 'long-distance' : player.eventType === 'short-distance'
    );

    // Split into heats if there are more than a certain number of participants
    const HEAT_SIZE = 8;
    while (eligiblePlayers.length) {
        const heatPlayers = eligiblePlayers.splice(0, HEAT_SIZE).map(p => p.playerId);
        race.heats.push({ playerIds: heatPlayers, times: {} });
        race.participants.push(...heatPlayers);
    }
}
