import { openDB, deleteDB, wrap, unwrap } from 'idb';
import { Game } from '@/types/game';
import { Team } from '@/types/team';
import { Player } from '@/types/player';
import { initializeIDTracker, getCurrentIDs } from './idTracker';

const DATABASE_NAME = 'sportsSimDB';
const DATABASE_VERSION = 6;
const GAME_STORE = 'games';

export async function initializeDB() {
    return await openDB(DATABASE_NAME, DATABASE_VERSION, {
        upgrade(db) {
            console.log('DB upgrade');
            if (!db.objectStoreNames.contains(GAME_STORE)) {
                db.createObjectStore(GAME_STORE, { keyPath: 'gameId' });
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
}

export async function saveGameData(gameData: Game) {
    const db = await initializeDB();
    const ids = getCurrentIDs(gameData.gameId);

    // Update game object with current ID counters for persistence
    gameData.lastPlayerId = ids.lastPlayerId;
    gameData.lastTeamId = ids.lastTeamId;
    await db.put(GAME_STORE, gameData);
}

export async function loadGameData(gameId: number): Promise<Game> {
    const db = await initializeDB();
    const game = await db.get(GAME_STORE, gameId);
    if (game) {
        initializeIDTracker(gameId, game.lastPlayerId, game.lastTeamId, game.lastMeetId); // Initialize ID tracker
    }
    return game;
}

export async function deleteGameData(gameId: number) {
    const db = await initializeDB();
    await db.delete(GAME_STORE, gameId); 
}

export async function loadAllGames(): Promise<Game[]> {
    const db = await initializeDB();
    return await db.getAll(GAME_STORE);
}

// Save team directly within the game
export async function saveTeamData(gameId: number, teamData: Team) {
    const db = await initializeDB();
    const game = await loadGameData(gameId);

    if (game) {
        const teamIndex = game.teams.findIndex(team => team.teamId === teamData.teamId);
        if (teamIndex !== -1) {
            game.teams[teamIndex] = teamData;
        } else {
            game.teams.push(teamData);
        }
        await saveGameData(game); // Save updated game data with the new team
    }
}

// Directly load team data by gameId and teamId
export async function loadTeamData(gameId: number, teamId: number): Promise<Team | null> {
    const game = await loadGameData(gameId);
    return game?.teams.find(team => team.teamId === teamId) || null;
}

// Save player data within the game
export async function savePlayerData(gameId: number, playerData: Player) {
    const db = await initializeDB();
    const game = await loadGameData(gameId);

    if (game) {
        const team = game.teams.find(t => t.teamId === playerData.teamId);
        if (team) {
            const playerIndex = team.players.findIndex(player => player.playerId === playerData.playerId);
            if (playerIndex !== -1) {
                team.players[playerIndex] = playerData;
            } else {
                team.players.push(playerData);
            }
            await saveGameData(game); // Update game data with new player info
        }
    }
}

// Direct access to load a specific player by gameId and playerId
export async function loadPlayerData(gameId: number, playerId: number): Promise<Player | null> {
    const game = await loadGameData(gameId);
    for (const team of game?.teams || []) {
        const player = team.players.find(p => p.playerId === playerId);
        if (player) {
            return player;
        }
    }
    return null; // Player not found
}