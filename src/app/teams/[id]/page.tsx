'use client';

import { useContext } from 'react';
import { GameContext } from '../../../context/GameContext';

interface TeamDetailsPageProps {
  params: {
    id: string;
  };
}

export default function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { state } = useContext(GameContext);
  const { id } = params;

  const team = state.teams.find((team) => team.id === Number(id));

  if (!team) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Team not found</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Team: {team.name}</h2>
      <h3 className="text-lg font-semibold">Athletes</h3>
      <ul>
        {team.athletes.map((athlete) => (
          <li key={athlete.id}>
            {athlete.name} - Events: {athlete.events.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
