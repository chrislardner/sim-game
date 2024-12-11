import { openDB, IDBPDatabase } from 'idb';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { Player } from '@/types/player';
import { Meet, Race } from '@/types/schedule';

// Database constants
const DATABASE_NAME = 'sportsSimDB';
const DATABASE_VERSION = 8;

export interface IDTracker {
    gameId: number;
    lastPlayerId: number;
    lastTeamId: number;
    lastMeetId: number;
    lastRaceId: number;
}

let db: IDBPDatabase | null = null;

// Initialize the database
export async function initializeDB() {
    if (db) return db;

    db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('global_ids')) {
                db.createObjectStore('global_ids', { keyPath: 'key' }); // For tracking game_counter
            }
            if (!db.objectStoreNames.contains('games')) {
                db.createObjectStore('games', { keyPath: 'gameId' });
            }
            if (!db.objectStoreNames.contains('teams')) {
                db.createObjectStore('teams', { keyPath: ['gameId', 'teamId'] }).createIndex('by_game', 'gameId');
            }
            if (!db.objectStoreNames.contains('players')) {
                db.createObjectStore('players', { keyPath: ['gameId', 'playerId'] }).createIndex('by_team', ['gameId', 'teamId']);
            }
            if (!db.objectStoreNames.contains('meets')) {
                db.createObjectStore('meets', { keyPath: ['gameId', 'meetId'] }).createIndex('by_game', 'gameId');
            }
            if (!db.objectStoreNames.contains('races')) {
                db.createObjectStore('races', { keyPath: ['gameId', 'raceId'] }).createIndex('by_meet', ['gameId', 'meetId']);
            }
            if (!db.objectStoreNames.contains('id_trackers')) {
                db.createObjectStore('id_trackers', { keyPath: 'gameId' });
            }
        },
    });

    return db;
}

export async function saveGame(game: Game) {
    const db = await initializeDB();
    await db.put('games', game);
}

export async function saveTeam(gameId: number, team: Team) {
    const db = await initializeDB();
    await db.put('teams', { ...team, gameId });
}

export async function savePlayer(gameId: number, player: Player) {
    const db = await initializeDB();
    await db.put('players', { ...player, gameId });
}

export async function saveMeet(gameId: number, meet: Meet) {
    const db = await initializeDB();
    await db.put('meets', { ...meet, gameId });
}

export async function saveRace(gameId: number, race: Race) {
    const db = await initializeDB();
    await db.put('races', { ...race, gameId });
}

export async function loadGameData(gameId: number) {
    const db = await initializeDB();
    const game = await db.get('games', gameId);
    return game;
}

export async function deleteGameData(gameId: number) {
    const db = await initializeDB();

    const game = await db.get('games', gameId);
    if (!game) {
        console.warn(`Game with ID ${gameId} does not exist.`);
        return;
    }

    console.log(`Deleting game ${gameId} and all related data...`);

    const deleteTx = db.transaction(['games', 'teams', 'players', 'meets', 'races', 'id_trackers'], 'readwrite');
    const promises = [
        deleteTx.objectStore('games').delete(gameId),
        deleteTx.objectStore('teams').delete(IDBKeyRange.only(gameId)),
        deleteTx.objectStore('players').delete(IDBKeyRange.bound([gameId, 0], [gameId, Infinity])),
        deleteTx.objectStore('meets').delete(IDBKeyRange.only(gameId)),
        deleteTx.objectStore('races').delete(IDBKeyRange.bound([gameId, 0], [gameId, Infinity])),
        deleteTx.objectStore('id_trackers').delete(gameId),
    ];
    await Promise.all(promises);
    await deleteTx.done;

    const allGames = await db.getAllKeys('games');

    const counterTx = db.transaction('global_ids', 'readwrite');
    const counterStore = counterTx.objectStore('global_ids');

    const newCounter = allGames.length > 0 ? Math.max(...allGames.map(Number)) : 0;
    await counterStore.put({ key: 'game_counter', value: newCounter });
    await counterTx.done;
}

export async function initializeIDTracker(gameId: number) {
    const db = await initializeDB();
    await db.put('id_trackers', {
        gameId,
        lastPlayerId: 0,
        lastTeamId: 0,
        lastMeetId: 0,
        lastRaceId: 0,
    });
}

export async function initializeGameCounter() {
    const db = await initializeDB();
    const tx = db.transaction('global_ids', 'readwrite');
    const store = tx.objectStore('global_ids');

    const existingCounter = await store.get('game_counter');
    if (!existingCounter) {
        await store.put({ key: 'game_counter', value: 0 });
    }

    await tx.done;
}

export async function getNextGameId(): Promise<number> {
    const db = await initializeDB();
    const tx = db.transaction('global_ids', 'readwrite');
    const store = tx.objectStore('global_ids');

    const counter = await store.get('game_counter');
    const newId = (counter?.value || 0) + 1;

    await store.put({ key: 'game_counter', value: newId });
    await tx.done;

    return newId;
}

async function getNextId(gameId: number, field: keyof IDTracker): Promise<number> {
    const db = await initializeDB();
    const tx = db.transaction('id_trackers', 'readwrite');
    const tracker = await tx.objectStore('id_trackers').get(gameId);

    if (!tracker) throw new Error(`ID Tracker not initialized for game ${gameId}`);

    tracker[field]++;
    await tx.objectStore('id_trackers').put(tracker);

    await tx.done;
    return tracker[field];
}

export const getNextPlayerId = (gameId: number) => getNextId(gameId, 'lastPlayerId');
export const getNextTeamId = (gameId: number) => getNextId(gameId, 'lastTeamId');
export const getNextMeetId = (gameId: number) => getNextId(gameId, 'lastMeetId');
export const getNextRaceId = (gameId: number) => getNextId(gameId, 'lastRaceId');

export async function loadAllGames() {
    const db = await initializeDB();
    return db.getAll('games');
}

export async function deleteAllGames() {
    const db = await initializeDB();

    console.log("Deleting all games and related data...");

    const tx = db.transaction(['games', 'teams', 'players', 'meets', 'races', 'id_trackers'], 'readwrite');

    await Promise.all([
        tx.objectStore('games').clear(),
        tx.objectStore('teams').clear(),
        tx.objectStore('players').clear(),
        tx.objectStore('meets').clear(),
        tx.objectStore('races').clear(),
        tx.objectStore('id_trackers').clear(),
    ]);

    await tx.done;

    const counterTx = db.transaction('global_ids', 'readwrite');
    const counterStore = counterTx.objectStore('global_ids');

    await counterStore.put({ key: 'game_counter', value: 0 });
    await counterTx.done;

}
