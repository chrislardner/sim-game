"use client";

import React, {createContext, useCallback, useContext, useMemo} from "react";
import {loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams} from "@/data/storage";
import {useData} from "@/hooks/useData";
import {Game} from "@/types/game";
import {Team} from "@/types/team";
import {Meet, Race} from "@/types/schedule";
import {Player} from "@/types/player";
import SimulationBar from "@/components/SimulationBar";

// ============================================================================
// GAME CONTEXT
// ============================================================================

type GameContextType = {
    game: Game | null;
    teams: Team[] | null;
    meets: Meet[] | null;
    races: Race[] | null;
    players: Player[] | null;
    userTeam: Team | null;
    loading: boolean;
    reload: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function useGameContext() {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error("useGameContext must be used within GameLayoutProvider");
    }
    return ctx;
}

// ============================================================================
// LAYOUT PROVIDER
// ============================================================================

type Props = {
    gameId: string;
    teamId?: string;
    children: React.ReactNode;
};

export default function GameLayoutProvider({gameId, children}: Props) {
    const id = Number(gameId);

    // Load all game data
    const {data: game, loading: gameLoading, reload: reloadGame} = useData(id, loadGameData);
    const {data: teams, loading: teamsLoading, reload: reloadTeams} = useData(id, loadTeams);
    const {data: meets, loading: meetsLoading, reload: reloadMeets} = useData(id, loadMeets);
    const {data: races, loading: racesLoading, reload: reloadRaces} = useData(id, loadRaces);
    const {data: players, loading: playersLoading, reload: reloadPlayers} = useData(id, loadPlayers);

    const loading = gameLoading || teamsLoading || meetsLoading || racesLoading || playersLoading;

    const reload = useCallback(() => {
        reloadGame();
        reloadTeams();
        reloadMeets();
        reloadRaces();
        reloadPlayers();
    }, [reloadGame, reloadTeams, reloadMeets, reloadRaces, reloadPlayers]);

    const userTeam = useMemo(() =>
            teams?.find(t => t.teamId === game?.selectedTeamId) ?? null,
        [teams, game?.selectedTeamId]
    );

    const contextValue: GameContextType = useMemo(() => ({
        game,
        teams,
        meets,
        races,
        players,
        userTeam,
        loading,
        reload,
    }), [game, teams, meets, races, players, userTeam, loading, reload]);

    if (loading || !game) {
        return (
            <div className="flex h-screen">
                <div
                    className="w-48 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800"/>
                <div className="flex-1">
                    <div
                        className="h-12 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700"/>
                    <div className="p-4">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded"/>
                            <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <GameContext.Provider value={contextValue}>
            <div className="">
                <SimulationBar game={game} onSimComplete={reload}/>
                <main className="px-4">
                    {children}
                </main>
            </div>
        </GameContext.Provider>
    );
}