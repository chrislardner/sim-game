import { initializeNewGame } from '@/logic/gameSetup';
import { loadGameData } from '@/data/storage';

test('Create new game with teams and players', async () => {
    const gameData = await initializeNewGame(3, 5); // Example: 3 teams, 5 players each
    expect(gameData.teams.length).toBe(3);
    expect(gameData.teams[0].players.length).toBe(5);

    const loadedData = await loadGameData(gameData.gameId);
    expect(loadedData).toMatchObject(gameData);
});
