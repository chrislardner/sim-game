'use client';

import React, { useContext } from 'react';
import { GameContext } from '../../context/GameContext'; // Ensure this path is correct

export default function SimulatePage() {
  const { state, dispatch } = useContext(GameContext);

  const simulateEvent = () => {
    dispatch({ type: 'SIMULATE_MEET' });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Simulation</h2>
      <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={simulateEvent}>
        Simulate Next Meet
      </button>
    </div>
  );
}
