'use client';

import React, { useContext } from 'react';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';
import Link from 'next/link';

const GameDashboard = ({ params }: { params: { id: string } }) => {
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
          {userTeam.name} Dashboard
        </h1>
        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300">
            Current Week: {state.currentWeek}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Total Points: {userTeam.stats.totalPoints}
          </p>
          <div className="mt-4 space-x-4">
            <Link
              href={`/game/${params.id}/team`}
              className="text-blue-500 hover:underline"
            >
              View Team
            </Link>
            <Link
              href={`/game/${params.id}/schedule`}
              className="text-blue-500 hover:underline"
            >
              View Schedule
            </Link>
            <Link
              href={`/game/${params.id}/standings`}
              className="text-blue-500 hover:underline"
            >
              League Standings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;
