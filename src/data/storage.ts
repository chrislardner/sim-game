import { openDB, IDBPDatabase } from 'idb';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { Player } from '@/types/player';
import { Meet, Race } from '@/types/schedule';

// Database constants
const DATABASE_NAME = 'sportsSimDB';
const DATABASE_VERSION = 13;

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
    try {
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
                    const playerStore = db.createObjectStore('players', { keyPath: ['gameId', 'playerId'] });
                    playerStore.createIndex('by_team', ['gameId', 'teamId']);
                    playerStore.createIndex('by_retired', ['gameId', 'retiredYear']);
                    playerStore.createIndex('by_game', 'gameId');
                }
                if (!db.objectStoreNames.contains('meets')) {
                    db.createObjectStore('meets', { keyPath: ['gameId', 'meetId'] }).createIndex('by_game', 'gameId');
                }
                if (!db.objectStoreNames.contains('races')) {
                    const raceStore = db.createObjectStore('races', { keyPath: ['gameId', 'raceId'] });
                    raceStore.createIndex('by_meet', ['gameId', 'meetId']);
                    raceStore.createIndex('by_game', 'gameId');
                }
                if (!db.objectStoreNames.contains('id_trackers')) {
                    db.createObjectStore('id_trackers', { keyPath: 'gameId' });
                }
            },
            blocked() {
                console.log('DB blocked');
            },
            terminated() {
                console.log('DB terminated');
            },
            blocking() {     
                console.log('DB blocking');
            }
        });
    } catch (error) {
        console.error('Failed to initialize the database:', error);
        throw new Error('Failed to initialize the database');
    }

    return db;
}

async function putData(storeName: string, data: unknown): Promise<IDBValidKey> {
    if (data === undefined || data === null) {
        console.warn(`Attempted to put undefined or null data into ${storeName}`);
        throw new Error(`Invalid data for ${storeName}`);
    }

    try {
        const db = await initializeDB();
        if (db) {
            const dbSuccess = await db.put(storeName, data);
            return dbSuccess;
        } else {
            console.error(`Database is not initialized. Failed to put data into ${storeName}`);
            throw new Error(`Database is not initialized for ${storeName}`);
        }
    } catch (error) {
        console.error(`Failed to put data into ${storeName}:`, error);
        throw error;
    }
}

export async function saveGame(game: Game): Promise<IDBValidKey> {
    return await putData('games', game);
}

export async function saveTeam(gameId: number, team: Team): Promise<IDBValidKey> {
    return await putData('teams', { ...team, gameId });
}

export async function savePlayer(gameId: number, player: Player): Promise<IDBValidKey> {
    return await putData('players', { ...player, gameId });
}

export async function saveMeet(gameId: number, meet: Meet): Promise<IDBValidKey> {
    return await putData('meets', { ...meet, gameId });
}

export async function saveRace(gameId: number, race: Race): Promise<IDBValidKey> {
    return await putData('races', { ...race, gameId });
}

async function getData(storeName: string, key: unknown) {
    try {
        const db = await initializeDB();
        if (db) {
            return await db.get(storeName, key as IDBValidKey);
        } else {
            console.error(`Database is not initialized. Failed to get data from ${storeName}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to get data from ${storeName}:`, error);
    }
}

export async function loadGameData(gameId: number) {
    return await getData('games', gameId);
}

async function getAllFromIndex(storeName: string, indexName: string, key: unknown) {
    try {
        const db = await initializeDB();
        if (db) {
            return await db.getAllFromIndex(storeName, indexName, key as IDBValidKey);
        } else {
            console.error(`Database is not initialized. Failed to get data from index ${indexName} in ${storeName}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to get data from index ${indexName} in ${storeName}:`, error);
    }
}

export async function loadTeams(gameId: number): Promise<Team[]> {
    return await getAllFromIndex('teams', 'by_game', gameId) as Team[];
}

export async function loadPlayers(gameId: number): Promise<Player[]> {
    return await getAllFromIndex('players', 'by_game', gameId) as Player[];
}

export async function loadActivePlayers(gameId: number): Promise<Player[]> {
    return await getAllFromIndex('players', 'by_retired', [gameId, 0]) as Player[];
}

export async function loadMeets(gameId: number): Promise<Meet[]> {
    return await getAllFromIndex('meets', 'by_game', gameId) as Meet[];
}

export async function loadRaces(gameId: number): Promise<Race[]> {
    return await getAllFromIndex('races', 'by_game', gameId) as Race[];
}

export async function deleteGameData(gameId: number) {
    try {
        const db = await initializeDB();

        const game = await db.get('games', gameId);
        if (!game) {
            console.warn(`Game with ID ${gameId} does not exist.`);
            return;
        }

        const deleteTx = db.transaction(['games', 'teams', 'players', 'meets', 'races', 'id_trackers'], 'readwrite');
        const promises = [
            deleteTx.objectStore('games').delete(gameId),
            deleteTx.objectStore('teams').delete(IDBKeyRange.bound([gameId, 0], [gameId, Infinity])),
            deleteTx.objectStore('players').delete(IDBKeyRange.bound([gameId, 0], [gameId, Infinity])),
            deleteTx.objectStore('meets').delete(IDBKeyRange.bound([gameId, 0], [gameId, Infinity])),
            deleteTx.objectStore('races').delete(IDBKeyRange.bound([gameId, 0], [gameId, Infinity])),
            deleteTx.objectStore('id_trackers').delete(gameId),
        ];
        await Promise.all(promises);
        await deleteTx.done;

        if (!db) {
            console.error('Database is not initialized.');
            return;
        }
        const allGames = await db.getAllKeys('games');

        const counterTx = db.transaction('global_ids', 'readwrite');
        const counterStore = counterTx.objectStore('global_ids');

        const newCounter = allGames.length > 0 ? Math.max(...allGames.map(Number)) : 0;
        await counterStore.put({ key: 'game_counter', value: newCounter });
        await counterTx.done;
    } catch (error) {
        console.error(`Failed to delete game data for gameId ${gameId}:`, error);
    }
}

export async function initializeIDTracker(gameId: number) {
    await putData('id_trackers', {
        gameId,
        lastPlayerId: 0,
        lastTeamId: 0,
        lastMeetId: 0,
        lastRaceId: 0,
    });
}

export async function initializeGameCounter() {
    try {
        const db = await initializeDB();
        if (!db) {
            throw new Error('Database is not initialized.');
        }
        const tx = db.transaction('global_ids', 'readwrite');
        const store = tx.objectStore('global_ids');

        const existingCounter = await store.get('game_counter');
        if (!existingCounter) {
            await store.put({ key: 'game_counter', value: 0 });
        }

        await tx.done;
    } catch (error) {
        console.error('Failed to initialize game counter:', error);
    }
}

export async function getNextGameId(): Promise<number> {
    try {
        const db = await initializeDB();
        const tx = db.transaction('global_ids', 'readwrite');
        const store = tx.objectStore('global_ids');

        const counter = await store.get('game_counter');
        const newId = (counter?.value ?? 0) + 1;

        await store.put({ key: 'game_counter', value: newId });
        await tx.done;

        return newId;
    } catch (error) {
        console.error('Failed to get next game ID:', error);
        throw error;
    }
}

async function getNextId(gameId: number, field: keyof IDTracker): Promise<number> {
    try {
        const db = await initializeDB();
        if (!db) {
            throw new Error('Database is not initialized.');
        }
        const tx = db.transaction('id_trackers', 'readwrite');
        const tracker = await tx.objectStore('id_trackers').get(gameId);

        if (!tracker) throw new Error(`ID Tracker not initialized for game ${gameId}`);

        tracker[field]++;
        await tx.objectStore('id_trackers').put(tracker);

        await tx.done;
        return tracker[field];
    } catch (error) {
        console.error(`Failed to get next ID for field ${field} in game ${gameId}:`, error);
        throw error;
    }
}

export const getNextPlayerId = (gameId: number) => getNextId(gameId, 'lastPlayerId');
export const getNextTeamId = (gameId: number) => getNextId(gameId, 'lastTeamId');
export const getNextMeetId = (gameId: number) => getNextId(gameId, 'lastMeetId');
export const getNextRaceId = (gameId: number) => getNextId(gameId, 'lastRaceId');

export async function loadAllGames() {
    try {
        const db = await initializeDB();
        return await db.getAll('games');
    } catch (error) {
        console.error('Failed to load all games:', error);
    }
}

export async function deleteAllGames() {
    try {
        const db = await initializeDB();

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
    } catch (error) {
        console.error('Failed to delete all games:', error);
    }
}

async function saveMultiple<T>(storeName: string, gameId: number, items: T[]): Promise<boolean> {
    try {
        const db = await initializeDB();
        if (!db) {
            console.error('Database is not initialized. Failed to save multiple items.');
            return Promise.reject('Database is not initialized');
        }
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const item of items) {
            if (item === undefined || item === null) {
                console.warn(`Attempted to put undefined or null data into ${storeName}`);
                continue;
            }
            store.put({ ...item, gameId });
        }
        await tx.done;
        return Promise.resolve(true);
    } catch (error) {
        console.error(`Failed to save multiple items into ${storeName}:`, error);
        return Promise.reject(error);
    }
}

export async function saveTeams(gameId: number, teams: Team[]): Promise<boolean> {
    return await saveMultiple('teams', gameId, teams);
}

export async function savePlayers(gameId: number, players: Player[]): Promise<boolean> {
    return await saveMultiple('players', gameId, players);
}

export async function saveRaces(gameId: number, races: Race[]): Promise<boolean> {
    return await saveMultiple('races', gameId, races);
}

export async function saveMeets(gameId: number, meets: Meet[]): Promise<boolean> {
    return await saveMultiple('meets', gameId, meets);
}

async function deleteItem(storeName: string, key: unknown) {
    try {
        const db = await initializeDB();
        if (!db) {
            console.error(`Database is not initialized. Failed to delete item from ${storeName}.`);
            return;
        }
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const item = await store.get(key as IDBValidKey);
        if (!item) {
            console.error(`Item with key ${JSON.stringify(key as IDBValidKey)} does not exist in ${storeName}.`);
            return;
        }
        await store.delete(key as IDBValidKey);
        await tx.done;
    } catch (error) {
        console.error(`Failed to delete item from ${storeName} with key ${JSON.stringify(key)}:`, error);
    }
}

export async function deleteMeet(gameId: number, meetId: number) {
    await deleteItem('meets', [gameId, meetId]);
}

export async function deleteRace(gameId: number, raceId: number) {
    await deleteItem('races', [gameId, raceId]);
}

export async function deletePlayer(gameId: number, playerId: number) {
    await deleteItem('players', [gameId, playerId]);
}
