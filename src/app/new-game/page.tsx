'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';

const NewGamePage = () => {
  const [numTeams, setNumTeams] = useState(4);
  const { dispatch } = useContext(GameContext);
  const router = useRouter();

  const handleStartGame = () => {
    dispatch({ type: 'START_NEW_GAME', payload: numTeams });
    const newGameId = Date.now().toString();
    const savedGames = JSON.parse(localStorage.getItem('games') || '[]');
    savedGames.push({ id: newGameId, name: `Game ${savedGames.length + 1}` });
    localStorage.setItem('games', JSON.stringify(savedGames));
    router.push(`/game/${newGameId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Start New Game
        </h1>
        <div className="mt-4">
          <label className="block text-gray-700 dark:text-gray-300">
            Number of Teams:
          </label>
          <input
            type="number"
            value={numTeams}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            min={2}
            max={20}
            className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded py-2 px-3 text-gray-700 dark:text-gray-300"
          />
          <button
            onClick={handleStartGame}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGamePage;
