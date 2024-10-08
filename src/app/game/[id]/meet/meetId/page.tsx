'use client';

import React, { useContext } from 'react';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';

const MeetPage = ({
  params,
}: {
  params: { id: string; meetId: string };
}) => {
  const { state } = useContext(GameContext);
  const meet = state.meets.find((m) => m.id === Number(params.meetId));

  if (!meet) {
    return <div>Meet not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {meet.name}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">Date: {meet.date}</p>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Team Results
        </h2>
        <ul>
          {meet.teamResults.map((teamResult) => {
            const team = state.teams.find((t) => t.id === teamResult.teamId);
            return (
              <li key={teamResult.teamId}>
                {team?.name} - Position: {teamResult.position} - Points:{' '}
                {teamResult.points}
              </li>
            );
          })}
        </ul>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Event Results
        </h2>
        {meet.events.map((event) => (
          <div key={event.id} className="mt-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {event.eventType}
            </h3>
            <ul>
              {event.results.map((result) => {
                const athlete = state.athletes.find(
                  (a) => a.id === result.athleteId
                );
                const team = state.teams.find(
                  (t) => t.id === athlete?.teamId
                );
                return (
                  <li key={result.id}>
                    {result.position}. {athlete?.name} ({team?.name}) -{' '}
                    {result.time}s - Points: {result.points}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetPage;
