"use client";

import React, {use, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Table, {type ColumnDef} from "@/components/Table";
import {loadMeets, loadPlayers, loadRaces, loadTeams} from "@/data/storage";
import type {Meet, Race} from "@/types/schedule";
import type {Player} from "@/types/player";
import type {Team} from "@/types/team";

type RouteParams = { gameId: string; raceId: string };

type ParticipantRow = {
    pos: number;
    playerId: number;
    playerName: string;
    teamId?: number;
    teamLabel: string;
    timeStr: string;
    points: number;
};

type TeamPointsRow = {
    teamId: number; teamLabel: string; points: number;
};

export default function RaceResultsPage({
                                            params,
                                        }: {
    params: Promise<RouteParams>;
}) {
    const {gameId, raceId} = use(params);
    const router = useRouter();

    const [race, setRace] = useState<Race | null>(null);
    const [meet, setMeet] = useState<Meet | null>(null);
    const [teamsById, setTeamsById] = useState<Record<number, Team>>({});
    const [playersById, setPlayersById] = useState<Record<number, Player>>({});
    const [metaOpen, setMetaOpen] = useState(false); // << expanded meta toggle

    useEffect(() => {
        let mounted = true;
        (async () => {
            const [races, meets, teams, players] = await Promise.all([loadRaces(Number(gameId)), loadMeets(Number(gameId)), loadTeams(Number(gameId)), loadPlayers(Number(gameId)),]);

            const r = races.find((x) => x.raceId === Number(raceId)) ?? null;
            const m = r ? meets.find((mm) => mm.meetId === Number(r.meetId)) ?? null : null;

            if (!mounted) return;

            setRace(r);
            setMeet(m);

            const tMap: Record<number, Team> = {};
            for (const t of teams) tMap[t.teamId] = t;
            setTeamsById(tMap);

            const pMap: Record<number, Player> = {};
            for (const p of players) pMap[p.playerId] = p;
            setPlayersById(pMap);
        })();
        return () => {
            mounted = false;
        };
    }, [gameId, raceId]);

    const formatTime = (secs: number) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        const hundredths = Math.floor((secs % 1) * 100);
        return `${minutes}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
    };

    const teamIdByPlayerId: Record<number, number> = useMemo(() => {
        const map: Record<number, number> = {};
        for (const k in teamsById) {
            const team = teamsById[Number(k)];
            for (const pid of team.players ?? []) map[pid] = team.teamId;
        }
        return map;
    }, [teamsById]);

    const participantRows: ParticipantRow[] = useMemo(() => {
        if (!race) return [];
        const sorted = [...race.participants].sort((a, b) => a.playerTime - b.playerTime);

        return sorted.map((p, idx) => {
            const player = playersById[p.playerId];
            const tId = teamIdByPlayerId[p.playerId];
            const team = tId ? teamsById[tId] : undefined;

            return {
                pos: idx + 1,
                playerId: p.playerId,
                playerName: player ? `${player.firstName} ${player.lastName}` : `Player #${p.playerId}`,
                teamId: team?.teamId,
                teamLabel: team ? `${team.college} (${team.abbr})` : "—",
                timeStr: formatTime(p.playerTime),
                points: p.scoring?.points ?? 0,
            };
        });
    }, [race, playersById, teamIdByPlayerId, teamsById]);

    const teamPointsRows: TeamPointsRow[] = useMemo(() => {
        if (!race) return [];
        const rows = (race.teams ?? []).map((t) => {
            const team = teamsById[t.teamId];
            return {
                teamId: t.teamId,
                teamLabel: team ? `${team.college} (${team.abbr})` : `Team #${t.teamId}`,
                points: t.points ?? 0,
            };
        });

        const isXC = meet?.season === "cross_country";
        rows.sort((a, b) => (isXC ? a.points - b.points : b.points - a.points));
        return rows;
    }, [race, teamsById, meet?.season]);

    const participantColumns: ColumnDef<ParticipantRow>[] = [{
        id: "pos", field: "pos", label: "Pos", className: "w-16", sortable: true
    }, {
        id: "player", label: "Player", sortable: true, render: (r) => (<Link
            href={`/games/${gameId}/players/${r.playerId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.playerName}
        </Link>),
    }, {
        id: "team", label: "Team", sortable: true, render: (r) => r.teamId ? (<Link
            href={`/games/${gameId}/teams/${r.teamId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.teamLabel}
        </Link>) : (<span>—</span>),
    }, {id: "time", field: "timeStr", label: "Time", className: "w-28", sortable: true}, {
        id: "pts", field: "points", label: "Pts", className: "w-16", sortable: true
    },];

    const teamPointsColumns: ColumnDef<TeamPointsRow>[] = [{
        id: "team", label: "Team", render: (r) => (<Link
            href={`/games/${gameId}/teams/${r.teamId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
        >
            {r.teamLabel}
        </Link>),
    }, {id: "points", field: "points", label: "Points", className: "w-24", sortable: true},];

    if (!race) {
        return <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400">Loading…</div>;
    }

    const meetHref = meet ? `/games/${gameId}/league/schedule/${meet.meetId}` : undefined;

    return (<div className="py-4 md:p-6">
        <header className="mb-4 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-primary-light dark:text-primary-dark">
                Race Results
            </h1>
            <div className="ml-auto text-sm text-neutral-600 dark:text-neutral-300">
                {meetHref ? (<button
                    onClick={() => router.push(meetHref)}
                    className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                    View Meet
                </button>) : null}
            </div>
        </header>

        <section
            className="mb-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 px-4 py-3">
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

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Meet:</span>{" "}
                    {meetHref ? (<Link href={meetHref} className="font-medium hover:underline">
                        {meet?.week} • {meet?.season}
                    </Link>) : (<span className="font-medium">
                {meet?.week} • {meet?.season}
              </span>)}
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Teams:</span>
                    <div className="flex flex-wrap gap-1">
                        {(meet?.teams ?? []).map((t) => {
                            const team = teamsById[t.teamId];
                            return team ? (<Link
                                key={t.teamId}
                                href={`/games/${gameId}/teams/${t.teamId}`}
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
                    <span className="text-neutral-500 dark:text-neutral-400">Event:</span>{" "}
                    <span className="font-medium">{race.eventType}</span>
                </div>
            </div>

            {metaOpen && (<div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
                    Teams (full names)
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 text-sm">
                    {(meet?.teams ?? []).map((t) => {
                        const team = teamsById[t.teamId];
                        if (!team) {
                            return (<li key={t.teamId} className="text-neutral-600 dark:text-neutral-300">
                                Team #{t.teamId}
                            </li>);
                        }
                        return (<li key={t.teamId}>
                            <Link
                                href={`/games/${gameId}/teams/${t.teamId}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {team.college} ({team.abbr})
                            </Link>
                        </li>);
                    })}
                </ul>
            </div>)}
        </section>

        <section
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60">
            <header className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold">Results</h2>
            </header>
            <div className="px-2 py-3">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                    <Table<ParticipantRow> data={participantRows} columns={participantColumns}/>
                </div>
            </div>
        </section>

        <section
            className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60">
            <header className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold">Team Points</h2>
            </header>
            <div className="px-2 py-3">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                    <Table<TeamPointsRow> data={teamPointsRows} columns={teamPointsColumns}/>
                </div>
            </div>
        </section>
    </div>);
}
