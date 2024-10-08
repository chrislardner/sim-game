'use client';

import React, { useContext } from 'react';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';
import Link from 'next/link';

const TeamPage = ({ params }: { params: { id: string } }) => {
  const { state } = useContext(GameContext);
  const userTeam = state.teams.find((team) => team.isUserTeam);

  if (!userTeam) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userTeam.name}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Rank: {userTeam.stats.rank}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Total Points: {userTeam.stats.totalPoints}
        </p>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Athletes
        </h2>
        <ul className="mt-2">
          {userTeam.athletes.map((athlete) => (
            <li key={athlete.id} className="mb-1">
              <Link
                href={`/game/${params.id}/athlete/${athlete.id}`}
                className="text-blue-500 hover:underline"
              >
                {athlete.name} - {athlete.schoolYear}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamPage;
