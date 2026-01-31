"use client";

import {use, useState} from "react";
import {useRouter} from "next/navigation";
import {loadGameData, loadTeams} from "@/data/storage";
import {simulateWeek} from "@/logic/simulation";
import {useData} from "@/hooks/useData";

export default function GameDashboard({params}: Readonly<{ params: Promise<{ gameId: string }> }>) {
    const {gameId} = use(params);
    const id = Number(gameId);
    const router = useRouter();

    const {
        data: gameData,
        loading: gameLoading,
        reload: reloadGame,
    } = useData(id, loadGameData);

    const {
        data: teams,
        loading: teamsLoading,
        reload: reloadTeams,
    } = useData(id, loadTeams);

    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulateWeek = async () => {
        if (!gameData || isSimulating) return;

        setIsSimulating(true);

        try {
            const success = await simulateWeek(gameData.gameId);
            if (!success) {
                console.error("SIMULATE FAILURE");
                return;
            }
            reloadGame();
            reloadTeams();

        } catch (err) {
            console.error("Error simulating week", err);
        } finally {
            setIsSimulating(false);
        }
    };

    if (gameLoading || teamsLoading || !gameData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="py-4 transition-colors">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Dashboard</h1>

            <button onClick={handleSimulateWeek} disabled={isSimulating}
                    className="px-4 py-2 bg-accent-dark hover:bg-accent-light font-semibold text-white rounded-sm"
            >
                {isSimulating ? "Simulating..." : "Simulate Next Week"}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Team</h2>
                    <p className="text-blue-500 hover:underline cursor-pointer"
                       onClick={() => router.push(`/games/${gameData.gameId}/team/${gameData.selectedTeamId}`)}>
                        {teams?.[gameData.selectedTeamId - 1]?.college}
                    </p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Week</h2>
                    <p>{gameData.currentWeek}</p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Game Phase</h2>
                    <p>{gameData.gamePhase}</p>
                </div>
                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                    <h2 className="text-lg font-semibold">Current Year</h2>
                    <p>{gameData.currentYear}</p>
                </div>
            </div>
        </div>
    );
}
