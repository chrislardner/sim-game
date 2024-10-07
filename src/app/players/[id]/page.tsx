'use client';

import { useContext } from 'react';
import { GameContext } from '../../../context/GameContext';

interface PlayerDetailsPageProps {
  params: {
    id: string;
  };
}

export default function PlayerDetailsPage({ params }: PlayerDetailsPageProps) {
  const { state } = useContext(GameContext);
  const { id } = params;

  const athlete = state.athletes.find((athlete) => athlete.id === id);

  if (!athlete) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Player not found</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Player: {athlete.name}</h2>
      <p>Team: {athlete.teamId}</p>
      <p>Events: {athlete.events.join(', ')}</p>
      <h3 className="text-lg font-semibold">Stats</h3>
      <ul>
        <li>Speed: {athlete.stats.speed}</li>
        <li>Endurance: {athlete.stats.endurance}</li>
        <li>Strength: {athlete.stats.strength}</li>
        <li>Competitions: {athlete.stats.competitions}</li>
        <li>Wins: {athlete.stats.wins}</li>
      </ul>
    </div>
  );
}
