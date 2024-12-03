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
    eventTypes: { cross_country: string[]; track_field: string[] };
    seasons: ('track_field' | 'cross_country')[]; 
    year: number;
    face: string; // Assuming face is a URL or base64 string representing the player's face
}
