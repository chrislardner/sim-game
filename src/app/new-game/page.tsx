'use client';

import { useEffect, useState } from 'react';
import { initializeNewGame } from '@/logic/gameSetup';
import { useRouter } from 'next/navigation';
import { getAllConferences, getCollegesbyConferenceId } from '@/data/parseSchools';
import { Conference, School } from '@/types/regionals';

export default function NewGamePage() {
    const [conferenceIds, setConferenceIds] = useState<number[]>([]);
    const [numPlayers, setNumPlayers] = useState(10);
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [selectedConferences, setSelectedConferences] = useState<Conference[] | null>(null);
    const [schools, setSchools] = useState<School[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const conferences = await getAllConferences();
            setConferences(conferences);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchSchools = async () => {
            if (selectedConferences) {
                const schools = await Promise.all(selectedConferences.map(conf => getCollegesbyConferenceId(conf.conferenceId)));
                const flatSchools = schools.flat();
                setSchools(flatSchools);
                if (selectedSchool && !flatSchools.some(school => school.collegeId === selectedSchool)) {
                    setSelectedSchool(null);
                }
            }
        };
        fetchSchools();
    }, [selectedConferences, selectedSchool]);

    const handleCreateGame = async () => {
        if (conferenceIds.length === 0 || !selectedSchool) {
            alert("Please select at least one conference and a school to start the game.");
            return;
        }
        const newGame = await initializeNewGame(conferenceIds, numPlayers, selectedSchool);
        // Redirect to the newly created game's page
        router.push(`/games/${newGame.gameId}`);
    };

    const handleConferenceClick = (conferenceId: number) => {
        setConferenceIds(prevIds => {
            const newIds = prevIds.includes(conferenceId)
                ? prevIds.filter(id => id !== conferenceId)
                : [...prevIds, conferenceId];
            setSelectedConferences(conferences.filter(conf => newIds.includes(conf.conferenceId)));
            return newIds;
        });
    };

    const filteredConferences = conferences.filter(conference =>
        conference.conferenceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <input
                        placeholder="Search Conferences"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4 p-2 border rounded text-text-light"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredConferences
                            .sort((a, b) => a.conferenceName.localeCompare(b.conferenceName))
                            .map((conference) => (
                                <div
                                    key={`conference-${conference.conferenceId}`}
                                    onClick={() => handleConferenceClick(conference.conferenceId)}
                                    className={`p-4 rounded-lg cursor-pointer text-center transition-colors duration-200 ${conferenceIds.includes(conference.conferenceId)
                                            ? 'bg-secondary-dark text-text-dark'
                                            : 'bg-info-dark text-text-dark hover:bg-info-light hover:text-text-light'
                                        }`}
                                >
                                    {conference.conferenceName}
                                </div>
                            ))}
                    </div>
                </div>
                {selectedConferences && (
                    <div>
                        <h2>Select School</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schools.map((school) => (
                                <div
                                    key={`school-${school.collegeId}`}
                                    onClick={() => setSelectedSchool(school.collegeId)}
                                    className={`p-4 rounded-lg cursor-pointer text-center transition-colors duration-200 ${selectedSchool === school.collegeId
                                            ? 'bg-secondary-dark text-text-dark'
                                            : 'bg-info-dark text-text-dark hover:bg-info-light hover:text-text-light'
                                        }`}
                                >
                                    {school.collegeName}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
