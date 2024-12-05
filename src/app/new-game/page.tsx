'use client';

import { useEffect, useState } from 'react';
import { initializeNewGame } from '@/logic/gameSetup';
import { useRouter } from 'next/navigation';
import { getAllColleges, getAllConferences } from '@/data/parseSchools';
import { Conference, School } from '@/types/regionals';

export default function NewGamePage() {
    const [conferenceIds, setConferenceIds] = useState<number[]>([]);
    const [numPlayers, setNumPlayers] = useState(10);
    const [schools, setSchools] = useState<School[]>([]);
    const [conferences, setConferences] = useState<Conference[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const schools = await getAllColleges();
            setSchools(schools);
            const conferences = await getAllConferences();
            setConferences(conferences);
        };
        fetchData();
    }, []);

    const handleCreateGame = async () => {
        console.log(conferenceIds);
        if (conferenceIds.length === 0) {
            alert("Please select at least one conference to start the game.");
            return;
        }
        const newGame = await initializeNewGame(conferenceIds, numPlayers, schools, conferences);
        // Redirect to the newly created game's page
        router.push(`/games/${newGame.gameId}`);
    };


    // Updated ConferenceGrid component with Tailwind CSS styling
    const ConferenceGrid = ({
        conferences,
        selectedConferenceIds,
        setSelectedConferenceIds,
    }: {
        conferences: Conference[];
        selectedConferenceIds: number[];
        setSelectedConferenceIds: React.Dispatch<React.SetStateAction<number[]>>;
    }) => {
        const handleConferenceClick = (conferenceId: number) => {
            setSelectedConferenceIds((prev) =>
                prev.includes(conferenceId)
                    ? prev.filter((id) => id !== conferenceId)
                    : [...prev, conferenceId]
            );
        };

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {conferences
                    .sort((a, b) => a.conferenceName.localeCompare(b.conferenceName))
                    .map((conference) => (
                        <div
                            key={conference.conferenceId}
                            onClick={() => handleConferenceClick(conference.conferenceId)}
                            className={`p-4 rounded-lg cursor-pointer text-center transition-colors duration-200 ${selectedConferenceIds.includes(conference.conferenceId)
                                    ? 'bg-secondary-dark text-text-dark'
                                    : 'bg-info-dark text-text-dark hover:bg-info-light hover:text-text-light'
                                }`}
                        >
                            {conference.conferenceName}
                        </div>
                    ))}
            </div>
        );
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
                <div>
                    <h2>Select Conferences</h2>
                    <ConferenceGrid
                        conferences={conferences}
                        selectedConferenceIds={conferenceIds}
                        setSelectedConferenceIds={setConferenceIds}
                    />
                </div>
                <label>
                    Number of Players per Team:
                    <input
                        type="number"
                        value={numPlayers}
                        onChange={(e) => setNumPlayers(Number(e.target.value))}
                        min="1"
                        className="ml-2 text-black"
                    />
                </label>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Start Game
                </button>
            </form>
        </div>
    );
}



