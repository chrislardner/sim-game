'use client';

import { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import Link from 'next/link';

export default function AllTeamsPage() {
  const { state } = useContext(GameContext);
  const { teams } = state;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">All Teams</h2>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            <Link href={`/teams/${team.id}`}>{team.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
