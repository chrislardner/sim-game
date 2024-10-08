'use client';

import React, { useContext } from 'react';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';

const StandingsPage = ({ params }: { params: { id: string } }) => {
  const { state } = useContext(GameContext);

  const sortedTeams = [...state.teams].sort(
    (a, b) => a.stats.rank - b.stats.rank
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          League Standings
        </h1>
        <table className="mt-4 w-full table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Team</th>
              <th className="px-4 py-2">Total Points</th>
              <th className="px-4 py-2">Wins</th>
              <th className="px-4 py-2">Competitions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team) => (
              <tr key={team.id} className="bg-white dark:bg-gray-700">
                <td className="border px-4 py-2">{team.stats.rank}</td>
                <td className="border px-4 py-2">{team.name}</td>
                <td className="border px-4 py-2">{team.stats.totalPoints}</td>
                <td className="border px-4 py-2">{team.stats.wins}</td>
                <td className="border px-4 py-2">
                  {team.stats.competitions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsPage;
