'use client';

import { useState } from 'react';
import { useContext } from 'react';
import { GameContext } from '../../context/GameContext';

export default function NewGamePage() {
  const [numTeams, setNumTeams] = useState(4);
  const { dispatch } = useContext(GameContext);

  const startGame = () => {
    dispatch({ type: 'START_NEW_GAME', payload: numTeams });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Start a New Game</h1>
      <div className="mt-4">
        <label className="block text-lg">
          Number of Teams:
          <input
            type="number"
            value={numTeams}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            min="2"
            max="32"
            className="ml-2 p-1 border rounded"
          />
        </label>
        <button
          onClick={startGame}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
