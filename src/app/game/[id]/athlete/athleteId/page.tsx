'use client';

import React, { useContext } from 'react';
import NavBar from '@/components/NavBar';
import { GameContext } from '@/context/GameContext';

const AthletePage = ({
  params,
}: {
  params: { id: string; athleteId: string };
}) => {
  const { state } = useContext(GameContext);
  const athlete = state.athletes.find((a) => a.id === params.athleteId);

  if (!athlete) {
    return <div>Athlete not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {athlete.name}
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          School Year: {athlete.schoolYear}
        </p>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Stats
        </h2>
        <ul>
          <li>Speed: {athlete.stats.speed}</li>
          <li>Endurance: {athlete.stats.endurance}</li>
          <li>Strength: {athlete.stats.strength}</li>
          <li>Competitions: {athlete.stats.competitions}</li>
          <li>Wins: {athlete.stats.wins}</li>
        </ul>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Personal Records
        </h2>
        <ul>
          {Object.entries(athlete.stats.personalRecords).map(
            ([event, time]) => (
              <li key={event}>
                {event}: {time}s
              </li>
            )
          )}
        </ul>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Race Results
        </h2>
        <ul>
          {athlete.stats.raceResults.map((result, index) => (
            <li key={index}>
              {result.date} - {result.eventType} - {result.time}s - Position:{' '}
              {result.position} - Points: {result.points}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AthletePage;
