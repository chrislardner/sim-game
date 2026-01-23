"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import Table, {ColumnDef} from "@/components/Table";
import {deleteAllGames, deleteGameData, loadAllGames} from "@/data/storage";
import type {Game} from "@/types/game";
import {FaPlay, FaTrashAlt} from "react-icons/fa";

type GameMeta = {
    createdAt?: string;
    lastPlayedAt?: string;
};

type LeagueRow = {
    id: number;
    phase: string;
    year: number;
    week: number;
    teamsCount: number;
    playersCount: number;
    selectedTeamId: number | string;
    createdAt?: string;
    lastPlayedAt?: string;
};

function fmtDate(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.valueOf())) return "—";
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

function useFooterAwareBottom(base = 16, gap = 12, footerSelector = "#site-footer, footer") {
    const [bottom, setBottom] = useState(base);

    useEffect(() => {
        const footer = document.querySelector(footerSelector) as HTMLElement | null;

        const update = () => {
            if (!footer) {
                setBottom(base);
                return;
            }
            const rect = footer.getBoundingClientRect();
            const overlap = Math.max(0, window.innerHeight - rect.top);
            const maxLift = rect.height + gap;
            const lift = Math.min(overlap, maxLift);
            setBottom(base + lift);
        };

        const onScroll = () => update();
        const onResize = () => update();
        window.addEventListener("scroll", onScroll, {passive: true});
        window.addEventListener("resize", onResize);
        const ro = new ResizeObserver(update);
        if (footer) ro.observe(footer);

        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            ro.disconnect();
        };
    }, [base, gap, footerSelector]);

    return bottom;
}

export default function GamesPage() {
    const [games, setGames] = useState<(Game & GameMeta)[]>([]);
    const [showModal, setShowModal] = useState(false);
    const bottom = useFooterAwareBottom(16, 12);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const saved = (await loadAllGames()) as (Game & GameMeta)[] | undefined;
            setGames(saved ?? []);
        })();
    }, []);

    const rows: LeagueRow[] = useMemo(
        () =>
            games.map((g) => ({
                id: g.gameId,
                phase: String(g.gamePhase),
                year: g.currentYear,
                week: g.currentWeek,
                teamsCount: g.teams?.length ?? 0,
                playersCount: g.players?.length ?? 0,
                selectedTeamId: g.selectedTeamId ?? "—",
                createdAt: g.createdAt,
                lastPlayedAt: g.lastPlayedAt,
            })),
        [games]
    );

    const handleNewGame = () => router.push("/new-game");
    const handleOpen = (gameId: number) => router.push(`/games/${gameId}`);

    const handleDelete = async (gameId: number) => {
        await deleteGameData(gameId);
        setGames((prev) => prev.filter((g) => g.gameId !== gameId));
    };

    const deleteAll = async () => {
        await deleteAllGames();
        setGames([]);
        setShowModal(false);
    };

    const columns: ColumnDef<LeagueRow>[] = [
        {
            id: "game",
            field: "id",
            label: "Game",
            className: "w-28",
            render: (r) => (
                <button
                    onClick={() => handleOpen(r.id)}
                    className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition"
                    aria-label={`Play game ${r.id}`}
                    title="Play"
                >
                    <FaPlay/>
                    <span>#{r.id}</span>
                </button>
            ),
        },
        {
            id: "phase",
            field: "phase",
            label: "Phase",
            className: "w-32",
            render: (r) => (
                <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {r.phase}
        </span>
            ),
        },
        {id: "year", field: "year", label: "Year", className: "w-20"},
        {id: "week", field: "week", label: "Week", className: "w-20"},
        {id: "teams", field: "teamsCount", label: "Teams", className: "w-20"},
        {id: "players", field: "playersCount", label: "Players", className: "w-24"},
        {id: "selected-team", field: "selectedTeamId", label: "Selected Team", className: "w-36"},
        {
            id: "last-played",
            field: "lastPlayedAt",
            label: "Last Played",
            className: "w-48",
            render: (r) => <span>{fmtDate(r.lastPlayedAt)}</span>,
        },
        {
            id: "created",
            field: "createdAt",
            label: "Created",
            className: "w-48",
            render: (r) => <span>{fmtDate(r.createdAt)}</span>,
        },
        {
            id: "actions",
            label: "Actions",
            className: "w-28 text-right",
            sortable: false,
            render: (r) => (
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        await handleDelete(r.id);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                    aria-label={`Delete game ${r.id}`}
                    title="Delete"
                >
                    <FaTrashAlt/>
                    <span>Delete</span>
                </button>
            ),
        },
    ];

    return (
        <div className="p-4 relative min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-primary-light dark:text-primary-dark">
                    Saved Games
                </h1>
                <button
                    onClick={handleNewGame}
                    className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg transition hover:bg-accent"
                >
                    New Game
                </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg transition-colors">
                <Table<LeagueRow> data={rows} columns={columns}/>
            </div>

            {games.length > 0 && (
                <div
                    className="fixed right-4 z-30"
                    style={{bottom}}
                >
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg transition hover:bg-red-700 shadow"
                    >
                        Delete All Games
                    </button>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">Delete all games?</h2>
                        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                            This will permanently remove all saved games.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-lg hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAll}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Yes, delete all
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
