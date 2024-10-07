'use client';

import Link from 'next/link';

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <ul className="flex space-x-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/team">My Team</Link>
        </li>
        <li>
          <Link href="/teams">All Teams</Link>
        </li>
        <li>
          <Link href="/players">All Players</Link>
        </li>
        <li>
          <Link href="/simulate">Simulate</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
