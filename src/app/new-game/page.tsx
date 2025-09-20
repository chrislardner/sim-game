"use client";

import {useCallback, useState} from "react";
import {useRouter} from "next/navigation";
import Table from "@/components/Table";
import Section from "@/components/new-game/Section";
import {initializeNewGame} from "@/logic/gameSetup";
import {useNewGameSetup} from "@/components/new-game/useNewGameSetup";
import {buildConferenceColumns, buildSchoolColumns} from "@/components/new-game/columns";
import {cn} from "@/lib/cn";

export default function NewGamePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const {
        conferenceRows,
        schoolRows,
        selectedConferenceIds,
        selectedSchoolId,
        confSearch,
        setConfSearch,
        schoolSearch,
        setSchoolSearch,
        loadingConfs,
        loadingSchools,
        toggleConference,
        selectSchool,
        resetForm,
        canSubmit,
        conferences,
    } = useNewGameSetup();

    const handleCreateGame = useCallback(async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const selectedConfs = conferences.filter((c) => selectedConferenceIds.has(c.conferenceId));
            const newGame = await initializeNewGame(selectedConfs, selectedSchoolId!);
            router.push(`/games/${newGame.gameId}`);
        } finally {
            setSubmitting(false);
        }
    }, [canSubmit, conferences, router, selectedConferenceIds, selectedSchoolId]);

    const conferenceColumns = buildConferenceColumns({selectedConferenceIds, toggleConference});
    const schoolColumns = buildSchoolColumns({selectedSchoolId, selectSchool});

    return (<div className="relative min-h-screen">
            <div className="container mx-auto px-4 pt-4 pb-2 md:pb-4">
                <header className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-primary-light dark:text-primary-dark">
                        Create a New Game
                    </h1>
                </header>

                <form
                    className="space-y-8"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateGame();
                    }}
                >
                    <Section
                        title="Step 1 • Choose Conferences"
                        subtitle="Select one or more conferences. The schools table (Step 2) will update automatically."
                        right={<span className="text-xs text-neutral-500 dark:text-neutral-400">
              Selected: <strong className="text-neutral-800 dark:text-neutral-200">{selectedConferenceIds.size}</strong>
            </span>}
                        defaultOpen
                    >
                        <div className="p-4">
                            <label htmlFor="conf-search" className="sr-only">Search Conferences</label>
                            <input
                                id="conf-search"
                                placeholder="Search by name or abbreviation…"
                                value={confSearch}
                                onChange={(e) => setConfSearch(e.target.value)}
                                className="mb-3 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-accent"
                            />
                            <div
                                className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                {loadingConfs ? (
                                    <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400">Loading
                                        conferences…</div>) : (
                                    <Table data={conferenceRows} columns={conferenceColumns}/>)}
                            </div>
                        </div>
                    </Section>

                    <Section
                        title="Step 2 • Choose Your School"
                        subtitle="Pick exactly one school from your selected conferences."
                        right={<span className="text-xs text-neutral-500 dark:text-neutral-400">
              Available: <strong className="text-neutral-800 dark:text-neutral-200">{schoolRows.length}</strong>
            </span>}
                        defaultOpen
                    >
                        <div className="p-4">
                            <label htmlFor="school-search" className="sr-only">Search Schools</label>
                            <input
                                id="school-search"
                                placeholder="Search by school, nickname, conference, city, or state…"
                                value={schoolSearch}
                                onChange={(e) => setSchoolSearch(e.target.value)}
                                className="mb-3 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-accent"
                            />
                            <div
                                className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                {loadingSchools ? (
                                    <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400">Loading
                                        schools…</div>) : (<Table data={schoolRows} columns={schoolColumns}/>)}
                            </div>
                        </div>
                    </Section>

                    <div className="h-2" aria-hidden="true"/>
                </form>
            </div>
            <div className="sticky bottom-0 z-30">
                <div
                    className="
                      relative left-1/2 -translate-x-1/2
                      w-[100vw] max-w-[100vw]
                      border-t border-neutral-200 dark:border-neutral-800
                      bg-surface-light/90 dark:bg-surface-dark/90
                      backdrop-blur supports-[backdrop-filter]:bg-surface-light/60
                      dark:supports-[backdrop-filter]:bg-surface-dark/60
                      pb-[env(safe-area-inset-bottom)]"
                >
                    <div className="page-x py-3 px-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm
                   text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateGame}
                            disabled={!canSubmit || submitting}
                            className={cn('px-4 py-2 rounded-md text-white text-sm transition', canSubmit && !submitting ? 'bg-primary-light dark:bg-primary-dark hover:bg-accent' : 'bg-neutral-400 cursor-not-allowed')}
                        >
                            {submitting ? 'Starting…' : 'Start Game'}
                        </button>
                    </div>
                </div>
            </div>

        </div>);
}
