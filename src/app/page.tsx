'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameSummary } from '@/types';
import NavBar from '@/components/NavBar';

const HomePage = () => {
  const [games, setGames] = useState<GameSummary[]>([]);

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('games') || '[]');
    setGames(savedGames);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Games
        </h1>
        <div className="mt-4">
          {games.length > 0 ? (
            <ul>
              {games.map((game) => (
                <li key={game.id} className="mb-2">
                  <Link
                    href={`/game/${game.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {game.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              No games found. Start a new game!
            </p>
          )}
          <Link
            href="/new-game"
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start New Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
