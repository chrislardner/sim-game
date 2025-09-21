"use client";

import {use, useEffect, useState} from 'react';
import {loadGameData, loadTeams} from '@/data/storage';
import {Game} from '@/types/game';
import {Team} from '@/types/team';

export default function RecruitingPage({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const {gameId} = use(params);
    const [gameData, setGameData] = useState<Game>();
    const [teams, setTeams] = useState<Team[]>();
    const [doneRecruiting, setDoneRecruiting] = useState(false);
    useEffect(() => {
        async function fetchData() {
            const data = await loadGameData(Number(gameId));
            setGameData(data);
            const teamsData = await loadTeams(Number(gameId));
            setTeams(teamsData);
        }

        fetchData();
    }, [gameId]);


    const handleRecruits: () => Promise<void> = async () => {
        if (!doneRecruiting && gameData) {
            try {
                const updatedGame = await loadGameData(gameData.gameId); // Reload to get an updated state
                setGameData(updatedGame);
                setDoneRecruiting(true);
                return Promise.resolve();
            } catch (error) {
                console.error("Error simulating week", error);
                return Promise.reject(error);
            }
        }
    };

    if (!gameData) return <div>Loading...</div>;

    return (
        <div className="py-4 transition-colors">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Dashboard</h1>

            <button
                onClick={handleRecruits}
                className="px-4 py-2 bg-accent-dark hover:bg-accent-light font-semibold text-white rounded-sm"
                disabled={doneRecruiting}
            >
                {'Handle Offseason'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Team</h2>
                    <p>{teams?.[0]?.college}</p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Week</h2>
                    <p>{gameData?.currentWeek} </p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Game Phase</h2>
                    <p>{gameData?.gamePhase}</p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Year</h2>
                    <p>{gameData?.currentYear} </p>
                </div>
            </div>
        </div>
    );
}