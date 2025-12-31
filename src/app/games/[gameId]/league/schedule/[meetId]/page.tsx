"use client";

import React, {use, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Table, {type ColumnDef} from "@/components/Table";
import {loadMeets, loadPlayers, loadRaces, loadTeams} from "@/data/storage";
import type {Meet, Race, RaceParticipant} from "@/types/schedule";
import type {Team} from "@/types/team";
import type {Player} from "@/types/player";

type RouteParams = { gameId: string; meetId: string };

type TeamPointsRow = {
    teamId: number; teamLabel: string; points: number;
};

type RaceTeamRow = {
    teamId: number; teamLabel: string; points: number;
};

type RaceParticipantRow = {
    playerId: number; playerName: string; teamId?: number; teamLabel: string; timeStr: string; points: number;
};

export default function MeetPage({params}: { params: Promise<RouteParams> }) {
    const {gameId, meetId} = use(params);
    const router = useRouter();

    const [meet, setMeet] = useState<Meet | null>(null);
    const [teamsById, setTeamsById] = useState<Record<number, Team>>({});
    const [racesById, setRacesById] = useState<Record<number, Race>>({});
    const [playersById, setPlayersById] = useState<Record<number, Player>>({});
    const [metaOpen, setMetaOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"teamPoints" | "playerPerformance">("teamPoints");

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [meets, teams, races, players] = await Promise.all([loadMeets(Number(gameId)), loadTeams(Number(gameId)), loadRaces(Number(gameId)), loadPlayers(Number(gameId)),]);

            const m = meets.find((mm) => mm.meetId === Number(meetId)) ?? null;
            if (!mounted) return;

            setMeet(m);

            const tMap: Record<number, Team> = {};
            for (const t of teams) tMap[t.teamId] = t;
            setTeamsById(tMap);

            const rMap: Record<number, Race> = {};
            for (const r of races) rMap[r.raceId] = r;
            setRacesById(rMap);

            const pMap: Record<number, Player> = {};
            for (const p of players) pMap[p.playerId] = p;
            setPlayersById(pMap);
        })();
        return () => {
            mounted = false;
        };
    }, [gameId, meetId]);

    const formatTime = (secs: number) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        const hundredths = Math.floor((secs % 1) * 100);
        return `${minutes}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
    };

    const isXC = meet?.season === "cross_country";

    const teamPointsRows: TeamPointsRow[] = useMemo(() => {
        if (!meet) return [];
        const rows = (meet.teams ?? []).map((t) => {
            const team = teamsById[t.teamId];
            return {
                teamId: t.teamId,
                teamLabel: team ? `${team.college} (${team.abbr})` : `Team #${t.teamId}`,
                points: t.points ?? 0,
            };
        });
        rows.sort((a, b) => (isXC ? a.points - b.points : b.points - a.points));
        return rows;
    }, [meet, teamsById, isXC]);

    const teamPointsColumns: ColumnDef<TeamPointsRow>[] = [{
        id: "team", label: "Team", render: (r) => (<Link
            href={`/games/${gameId}/team/${r.teamId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.teamLabel}
        </Link>),
    }, {id: "points", field: "points", label: "Points", className: "w-24", sortable: true},];

    const raceCards = useMemo(() => {
        if (!meet) return [];
        return (meet.races ?? [])
            .map((rid) => racesById[rid])
            .filter(Boolean) as Race[];
    }, [meet, racesById]);

    const buildRaceTeamRows = (race: Race): RaceTeamRow[] => {
        const rows = (race.teams ?? []).map((t) => {
            const team = teamsById[t.teamId];
            return {
                teamId: t.teamId, teamLabel: team ? `${team.abbr}` : `#${t.teamId}`, points: t.points ?? 0,
            };
        });
        rows.sort((a, b) => (isXC ? a.points - b.points : b.points - a.points));
        return rows;
    };

    const raceTeamColumns: ColumnDef<RaceTeamRow>[] = [{
        id: "team", label: "Team", render: (r) => (<Link
            href={`/games/${gameId}/team/${r.teamId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.teamLabel}
        </Link>),
    }, {id: "points", field: "points", label: "Points", className: "w-24", sortable: true},];

    const teamIdByPlayerId: Record<number, number> = useMemo(() => {
        const map: Record<number, number> = {};
        for (const k in teamsById) {
            const team = teamsById[Number(k)];
            for (const pid of team.players ?? []) map[pid] = team.teamId;
        }
        return map;
    }, [teamsById]);

    const buildRaceParticipantRows = (race: Race): RaceParticipantRow[] => {
        const sorted = [...(race.participants ?? [])].sort((a, b) => a.playerTime - b.playerTime);
        return sorted.map((p: RaceParticipant) => {
            const player = playersById[p.playerId];
            const tId = teamIdByPlayerId[p.playerId];
            const team = tId ? teamsById[tId] : undefined;
            return {
                playerId: p.playerId,
                playerName: player ? `${player.firstName} ${player.lastName}` : `Player #${p.playerId}`,
                teamId: team?.teamId,
                teamLabel: team ? team.abbr : "—",
                timeStr: formatTime(p.playerTime),
                points: p.scoring?.points ?? 0,
            };
        });
    };

    const raceParticipantColumns: ColumnDef<RaceParticipantRow>[] = [{
        id: "player", label: "Player", sortable: true, render: (r) => (<Link
            href={`/games/${gameId}/players/${r.playerId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.playerName}
        </Link>),
    }, {
        id: "team", label: "Team", render: (r) => r.teamId ? (<Link
            href={`/games/${gameId}/team/${r.teamId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.teamLabel}
        </Link>) : (<span>—</span>),
    }, {id: "points", field: "points", label: "Pts", className: "w-16", sortable: true}, {
        id: "time", field: "timeStr", label: "Time", className: "w-28", sortable: true
    },];

    if (!meet) {
        return <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400">Loading…</div>;
    }

    return (<div className="py-4 md:p-6">
        <header className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-semibold text-primary-light dark:text-primary-dark">
                    Meet • {meet.week} • {meet.season === "track_field" ? "Track & Field" : "Cross Country"}
                </h1>
            </div>

            <section
                className="mt-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">Meet Info</div>
                    <button
                        type="button"
                        aria-expanded={metaOpen}
                        onClick={() => setMetaOpen((v) => !v)}
                        className="text-xs rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                        {metaOpen ? "Hide details" : "Show details"}
                    </button>
                </div>
                <div className="ml-auto flex items-center gap-2">

                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Meet:</span>{" "}
                        <span className="font-medium"> {meet?.week} • {meet?.season} </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-500 dark:text-neutral-400">Teams:</span>
                        <div className="flex flex-wrap gap-1">
                            {(meet.teams ?? []).map((t) => {
                                const team = teamsById[t.teamId];
                                return team ? (<Link
                                    key={t.teamId}
                                    href={`/games/${gameId}/team/${t.teamId}`}
                                    className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                >
                                    {team.abbr}
                                </Link>) : (<span
                                    key={t.teamId}
                                    className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs"
                                >
                      #{t.teamId}
                    </span>);
                            })}
                        </div>
                    </div>

                    <div>
                        <span className="text-neutral-500 dark:text-neutral-400">Events:</span>{" "}
                        <span className="font-medium">{(meet.races ?? []).length}</span>
                    </div>
                </div>

                {metaOpen && (<div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <div
                        className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
                        Teams (full names)
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 text-sm">
                        {(meet.teams ?? []).map((t) => {
                            const team = teamsById[t.teamId];
                            return team ? (<li key={t.teamId}>
                                <Link
                                    href={`/games/${gameId}/team/${t.teamId}`}
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {team.college} ({team.abbr})
                                </Link>
                            </li>) : (<li key={t.teamId}>Team #{t.teamId}</li>);
                        })}
                    </ul>
                </div>)}
            </section>
        </header>

        <section
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60">
            <header className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold">Team Points</h2>
            </header>
            <div className="px-2 py-3">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                    <Table<TeamPointsRow> data={teamPointsRows} columns={teamPointsColumns}/>
                </div>
            </div>
        </section>

        <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Races</h2>
            <div
                className="inline-flex rounded-md border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setViewMode("teamPoints")}
                    className={`px-3 py-1 text-sm ${viewMode === "teamPoints" ? "bg-neutral-200 dark:bg-neutral-700" : "bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                >
                    Team Points
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode("playerPerformance")}
                    className={`px-3 py-1 text-sm ${viewMode === "playerPerformance" ? "bg-neutral-200 dark:bg-neutral-700" : "bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
                >
                    Player Performance
                </button>
            </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {raceCards.map((race) => {
                const raceHref = `/games/${gameId}/league/races/${race.raceId}`;

                return (<div
                    key={race.raceId}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60"
                >
                    <header
                        className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="text-base font-semibold">{race.eventType}</h3>
                        <button
                            onClick={() => router.push(raceHref)}
                            className="text-xs rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                            Open race
                        </button>
                    </header>

                    <div className="px-2 py-3">
                        {viewMode === "teamPoints" ? (<div
                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                            <Table<RaceTeamRow> data={buildRaceTeamRows(race)} columns={raceTeamColumns}/>
                        </div>) : (<div
                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                            <Table<RaceParticipantRow>
                                data={buildRaceParticipantRows(race)}
                                columns={raceParticipantColumns}
                            />
                        </div>)}
                    </div>
                </div>);
            })}
        </section>
    </div>);
}
