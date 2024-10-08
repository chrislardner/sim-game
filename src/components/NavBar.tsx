'use client';

import React from 'react';
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Track & Field Game
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/settings" className="hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
