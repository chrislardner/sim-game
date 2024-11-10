interface GameIDTracker {
    lastPlayerId: number;
    lastTeamId: number;
    lastMeetId: number;
}

const idTrackers: Record<number, GameIDTracker> = {}; // Map of gameId to ID counters

export function initializeIDTracker(gameId: number, lastPlayerId = 0, lastTeamId = 0, lastMeetId = 0) {
    idTrackers[gameId] = { lastPlayerId, lastTeamId, lastMeetId };
}

export function getNextPlayerId(gameId: number): number {
    if (!idTrackers[gameId]) {
        throw new Error(`ID Tracker not initialized for gameId ${gameId}`);
    }
    return ++idTrackers[gameId].lastPlayerId;
}

export function getNextTeamId(gameId: number): number {
    if (!idTrackers[gameId]) {
        throw new Error(`ID Tracker not initialized for gameId ${gameId}`);
    }
    return ++idTrackers[gameId].lastTeamId;
}

export function getNextMeetId(gameId: number): number {
    if (!idTrackers[gameId]) {
        throw new Error(`ID Tracker not initialized for gameId ${gameId}`);
    }
    return ++idTrackers[gameId].lastMeetId;
}

// Utility to get the current ID values for saving back to the database
export function getCurrentIDs(gameId: number) {
    return idTrackers[gameId];
}
