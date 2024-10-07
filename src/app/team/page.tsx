'use client';

import { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import Link from 'next/link';

export default function MyTeamPage() {
  const { state } = useContext(GameContext);
  const myTeam = state.teams.find((team) => team.isUserTeam); // Mark user's team

  if (!myTeam) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">You don't have a team yet!</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">My Team: {myTeam.name}</h2>
      <h3 className="text-xl font-semibold mt-4">Athletes</h3>
      <table className="min-w-full mt-2">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Events</th>
            <th className="px-4 py-2">School Year</th>
            <th className="px-4 py-2">Stats</th>
          </tr>
        </thead>
        <tbody>
          {myTeam.athletes.map((athlete) => (
            <tr key={athlete.id}>
              <td className="border px-4 py-2">
                <Link href={`/players/${athlete.id}`}>{athlete.name}</Link>
              </td>
              <td className="border px-4 py-2">{athlete.events.join(', ')}</td>
              <td className="border px-4 py-2">{athlete.schoolYear}</td>
              <td className="border px-4 py-2">
                Speed: {athlete.stats.speed}, Endurance: {athlete.stats.endurance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
