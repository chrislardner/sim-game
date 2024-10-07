'use client';

import { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import Link from 'next/link';

export default function AllPlayersPage() {
    const { state } = useContext(GameContext);
    const { athletes } = state;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">All Players</h2>
            <ul>
                {athletes.map((athlete) => (
                    <li key={athlete.id}>
                        <Link href={`/players/${athlete.id}`}>{athlete.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
