export interface Heat {
    playerIds: number[];   // List of players in this heat
    times: Record<number, number>; // Map player ID to time result in the heat
}

export interface Race {
    eventType: string;      // e.g., "100m", "200m", "8k Cross Country"
    heats: Heat[];          // Multiple heats for this race
    participants: number[];  // Player IDs participating in the race
}

export interface Meet {
    meetId: number;
    teams: number[];        // IDs of teams attending the meet
    date: string;           // Week number or date as a string
    races: Race[];
    type: string;           // "track-and-field" or "cross-country"
    
}
export interface PlayoffSchedule {
    round: number;           // Playoff round (1 for first round, etc.)
    matches: Meet[];         // Matches for this round
    remainingTeams: number[]; // IDs of teams still in playoffs
}