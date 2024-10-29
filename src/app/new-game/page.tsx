'use client';

import { useState } from 'react';
import { initializeNewGame } from '@/logic/gameSetup';
import { useRouter } from 'next/navigation';

export default function NewGamePage() {
    const [numTeams, setNumTeams] = useState(4);
    const [numPlayers, setNumPlayers] = useState(10);
    const router = useRouter();

    const handleCreateGame = async () => {
        const newGame = initializeNewGame(numTeams, numPlayers);
        // Redirect to the newly created game's page
        router.push(`/games/${newGame.gameId}`);
    };

    return (
        <div>
            <h1>Create a New Game</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateGame();
                }}
                className="flex flex-col gap-4"
            >
                <label>
                    Number of Teams:
                    <input
                        type="number"
                        value={numTeams}
                        onChange={(e) => setNumTeams(Number(e.target.value))}
                        min="1"
                        className="ml-2"
                    />
                </label>
                <label>
                    Number of Players per Team:
                    <input
                        type="number"
                        value={numPlayers}
                        onChange={(e) => setNumPlayers(Number(e.target.value))}
                        min="1"
                        className="ml-2"
                    />
                </label>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Start Game
                </button>
            </form>
        </div>
    );
}
