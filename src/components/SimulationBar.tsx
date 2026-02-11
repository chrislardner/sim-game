"use client";

import React, {useCallback, useState} from "react";
import {useRouter} from "next/navigation";
import {simulateWeek} from "@/logic/simulation";
import {Game} from "@/types/game";

type SimBarProps = {
    game: Game;
    onSimComplete?: () => void;
};

const PHASE_LABELS: Record<string, string> = {
    regular: "Regular Season",
    playoffs: "Playoffs",
    offseason: "Offseason",
};

export default function SimulationBar({game, onSimComplete}: SimBarProps) {
    const router = useRouter();
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulate = useCallback(async () => {
        if (isSimulating) return;

        setIsSimulating(true);
        try {
            const success = await simulateWeek(game.gameId);
            if (!success) {
                console.error("Simulation failed");
            }
            onSimComplete?.();
            router.refresh();
        } catch (err) {
            console.error("Error simulating:", err);
        } finally {
            setIsSimulating(false);
        }
    }, [game.gameId, isSimulating, onSimComplete, router]);

    const phaseLabel = PHASE_LABELS[game.gamePhase] || game.gamePhase;

    return (
        <div
            className="flex items-center justify-between h-11 px-4 bg-surface-light dark:bg-surface-dark border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-text-light dark:text-text-dark">
                    Year {game.currentYear}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500">·</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                    Week {game.currentWeek}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500">·</span>
                <span className="text-neutral-500 dark:text-neutral-500">
                    {phaseLabel}
                </span>
            </div>

            <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="
                    flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium
                    bg-primary-light dark:bg-primary-dark
                    text-white
                    hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-opacity
                "
            >
                {isSimulating ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    strokeWidth="3"/>
                            <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span>Simulating...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Simulate Week</span>
                    </>
                )}
            </button>
        </div>
    );
}