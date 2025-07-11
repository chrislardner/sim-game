"use client";

import {use, useEffect, useState} from 'react';
import {loadGameData, loadTeams} from '@/data/storage';
import {Game} from '@/types/game';
import {simulateWeek} from '@/logic/simulation';
import {Team} from '@/types/team';
import {useRouter} from 'next/navigation';

export default function GameDashboard({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const {gameId} = use(params);
    const [gameData, setGameData] = useState<Game>();
    const [teams, setTeamsData] = useState<Team[]>();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const data = await loadGameData(Number(gameId));
            setGameData(data);
            const teamsData = await loadTeams(Number(gameId));
            setTeamsData(teamsData);
        }

        fetchData();
    }, [gameId]);

    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulateWeek = async () => {
        if (gameData && !isSimulating) {
            setIsSimulating(true);
            try {
                const success = await simulateWeek(gameData.gameId);
                if (!success) console.error("SIMULATE FAILURE")
                // Fetch updated data after the simulation
                const updatedGame = await loadGameData(gameData.gameId);
                const updatedTeams = await loadTeams(gameData.gameId);

                setGameData({...updatedGame});
                setTeamsData([...updatedTeams]);

            } catch (error) {
                console.error("Error simulating week", error);
            } finally {
                setIsSimulating(false);
            }
        }
    };

    if (!gameData) return <div>Loading...</div>;

    return (
        <div className="p-4 transition-colors">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Dashboard</h1>

            <button
                onClick={handleSimulateWeek}
                className="px-4 py-2 bg-accent-dark hover:bg-accent-light font-semibold text-white rounded-sm"
                disabled={isSimulating}
            >
                {isSimulating ? 'Simulating...' : 'Simulate Next Week'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Team</h2>
                    <p className="text-blue-500 hover:underline cursor-pointer"
                       onClick={() => router.push(`/games/${gameData.gameId}/teams/${gameData.selectedTeamId}`)}>{teams && teams[gameData.selectedTeamId - 1]?.college}</p>
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