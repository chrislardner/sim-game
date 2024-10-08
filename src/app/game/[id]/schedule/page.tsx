'use client';

import React, { useContext } from 'react';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';
import Link from 'next/link';

const SchedulePage = ({ params }: { params: { id: string } }) => {
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
          Team Schedule
        </h1>
        <ul className="mt-4">
          {state.schedule.map((scheduleItem) => {
            const meet = state.meets.find(
              (m) => m.name === scheduleItem.meetName
            );
            const isCompleted = !!meet;
            const teamResult = meet?.teamResults.find(
              (tr) => tr.teamId === userTeam.id
            );
            return (
              <li key={scheduleItem.week} className="mb-2">
                <div className="flex justify-between">
                  <span>
                    Week {scheduleItem.week}:{' '}
                    <Link
                      href={`/game/${params.id}/meet/${meet?.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {scheduleItem.meetName}
                    </Link>
                  </span>
                  {isCompleted ? (
                    <span>
                      Placement: {teamResult?.position} - Points:{' '}
                      {teamResult?.points}
                    </span>
                  ) : (
                    <span>Upcoming</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SchedulePage;
