export interface PlayerStats {
    [key: string]: number; // Stats can be added as needed
}

export interface PlayerPersonality {
    [key: string]: number; // Placeholder for personality traits
}

export interface Player {
    playerId: number;
    teamId: number;
    firstName: string;
    lastName: string;
    stats: PlayerStats;
    personality: PlayerPersonality;
    eventType: string;
    seasons: string;
    year: number;
    face: any;
}
