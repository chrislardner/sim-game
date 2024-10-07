'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Welcome to Track and Field Manager</h1>
      <Link href="/new-game">
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Start New Game
        </button>
      </Link>
    </div>
  );
}
