'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Player, Recruit} from '@/types/player';
import {Team} from '@/types/team';
import {loadRecruits} from '@/data/storage';
import {useGameContext} from '@/components/GameLayoutProvider';
import {
    ArchetypeCategory,
    calculateFitScore,
    commitRecruit,
    DisplayRatings,
    getArchetypeCategory,
    getArchetypeLabel,
    getDisplayRatings,
    getInterestLevel,
    getKeyAttributes,
    getPrimaryOvr,
    getTeamNeeds,
    TeamNeeds,
} from '@/logic/recruiting';
import {cn} from '@/lib/cn';

// ─── Colour helpers matching app theme ───────────────────────────────────────

function ovrBadge(v: number) {
    if (v >= 80) return 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30';
    if (v >= 65) return 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30';
    if (v >= 50) return 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30';
    return 'bg-neutral-500/20 text-neutral-400 ring-1 ring-neutral-500/30';
}

function ovrBar(v: number) {
    if (v >= 80) return 'bg-green-500';
    if (v >= 65) return 'bg-blue-500';
    if (v >= 50) return 'bg-yellow-500';
    return 'bg-neutral-500';
}

function fitText(s: number) {
    if (s >= 68) return 'text-green-400';
    if (s >= 42) return 'text-yellow-400';
    return 'text-red-400';
}

function fitBar(s: number) {
    if (s >= 68) return 'bg-green-500';
    if (s >= 42) return 'bg-yellow-500';
    return 'bg-red-500';
}

function needStyle(label: 'High' | 'Medium' | 'Low') {
    if (label === 'High') return 'text-red-400 bg-red-500/10 ring-1 ring-red-500/20';
    if (label === 'Medium') return 'text-yellow-400 bg-yellow-500/10 ring-1 ring-yellow-500/20';
    return 'text-neutral-400 bg-neutral-500/10 ring-1 ring-neutral-500/20';
}

function archStyle(cat: ArchetypeCategory) {
    if (cat === 'distance') return 'bg-green-500/15 text-green-400 ring-1 ring-green-500/20';
    if (cat === 'sprint') return 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20';
    return 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20';
}

function interestStyle(level: 'high' | 'medium' | 'low') {
    if (level === 'high') return 'bg-green-500/10 text-green-400';
    if (level === 'medium') return 'bg-yellow-500/10 text-yellow-400';
    return 'bg-neutral-500/10 text-neutral-500';
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function StatBar({label, value}: { label: string; value: number }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-neutral-500">{label}</span>
            <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-neutral-700 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', ovrBar(value))} style={{width: `${value}%`}}/>
                </div>
                <span className="text-[11px] font-mono text-neutral-300 w-5 text-right tabular-nums">{value}</span>
            </div>
        </div>
    );
}

function TraitBar({label, value}: { label: string; value: number }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 w-28 shrink-0">{label}</span>
            <div className="flex-1 h-1 bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-light dark:bg-primary-dark rounded-full opacity-60"
                     style={{width: `${Math.min(100, value)}%`}}/>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 w-5 text-right tabular-nums">
                {Math.round(value)}
            </span>
        </div>
    );
}

// ─── Team needs strip ─────────────────────────────────────────────────────────

function NeedsStrip({
                        needs,
                        committed,
                        graduating,
                        rosterSize,
                    }: {
    needs: TeamNeeds;
    committed: number;
    graduating: number;
    rosterSize: number;
}) {
    const slots = [
        {label: 'Sprinters', need: needs.sprint},
        {label: 'Middle', need: needs.middle},
        {label: 'Distance', need: needs.distance},
    ] as const;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {slots.map(({label, need}) => (
                <div key={label}
                     className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', needStyle(need.label))}>
                            {need.label}
                        </span>
                    </div>
                    <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                            className={cn('h-full rounded-full',
                                need.label === 'High' ? 'bg-red-500'
                                    : need.label === 'Medium' ? 'bg-yellow-500'
                                        : 'bg-neutral-500'
                            )}
                            style={{width: `${need.value}%`}}
                        />
                    </div>
                </div>
            ))}
            <div
                className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Class</span>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-text-light dark:text-text-dark">{committed}</span>
                    <span className="text-xs text-neutral-500">committed</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                    {graduating} graduating · {rosterSize} on roster
                </p>
            </div>
        </div>
    );
}

// ─── Recruit row ──────────────────────────────────────────────────────────────

type OfferStatus = 'available' | 'offered' | 'committed';

function RecruitRow({
                        recruit,
                        fitScore,
                        ratings,
                        status,
                        expanded,
                        onToggle,
                        onOffer,
                        onWithdraw,
                        onCommit,
                        committing,
                    }: {
    recruit: Recruit;
    fitScore: number;
    ratings: DisplayRatings;
    status: OfferStatus;
    expanded: boolean;
    onToggle: () => void;
    onOffer: () => void;
    onWithdraw: () => void;
    onCommit: () => Promise<void>;
    committing: boolean;
}) {
    const cat = getArchetypeCategory(recruit);
    const archLabel = getArchetypeLabel(recruit);
    const interest = getInterestLevel(fitScore);
    const primaryOvr = getPrimaryOvr(recruit, ratings);
    const keyAttrs = getKeyAttributes(recruit, ratings);
    const isXC = recruit.seasons.includes('cross_country');
    const p = recruit.recruitPersonality;

    return (
        <div className={cn(
            'border-b border-neutral-200 dark:border-neutral-700 transition-colors',
            expanded && 'bg-neutral-50 dark:bg-neutral-800/40',
            !expanded && 'hover:bg-neutral-50 dark:hover:bg-neutral-800/20',
            status === 'committed' && 'opacity-50',
        )}>
            {/* ── Main row ── */}
            <div
                className="grid items-center px-4 py-3 cursor-pointer select-none"
                style={{gridTemplateColumns: '1fr 96px 60px 56px 110px 124px'}}
                onClick={onToggle}
            >
                {/* Name + archetype */}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                            {recruit.firstName} {recruit.lastName}
                        </span>
                        {isXC && (
                            <span
                                className="shrink-0 text-[10px] px-1.5 py-px rounded-sm bg-teal-500/15 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/25">
                                XC
                            </span>
                        )}
                    </div>
                    <span className={cn('text-[11px] px-1.5 py-px rounded-sm', archStyle(cat))}>
                        {archLabel}
                    </span>
                </div>

                {/* Events */}
                <div className="flex flex-wrap gap-1 items-center">
                    {recruit.eventTypes.track_field.slice(0, 2).map(e => (
                        <span key={e}
                              className="text-[10px] px-1 py-px rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                            {e}
                        </span>
                    ))}
                    {recruit.eventTypes.track_field.length > 2 && (
                        <span
                            className="text-[10px] text-neutral-400">+{recruit.eventTypes.track_field.length - 2}</span>
                    )}
                </div>

                {/* OVR */}
                <div className="flex justify-center">
                    <span
                        className={cn('text-xs font-bold font-mono px-2 py-0.5 rounded tabular-nums', ovrBadge(primaryOvr))}>
                        {primaryOvr}
                    </span>
                </div>

                {/* POT */}
                <div className="flex justify-center">
                    <span
                        className={cn('text-xs font-bold font-mono px-2 py-0.5 rounded tabular-nums', ovrBadge(ratings.potential))}>
                        {ratings.potential}
                    </span>
                </div>

                {/* Fit */}
                <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center justify-between">
                        <span className={cn('text-xs font-bold tabular-nums', fitText(fitScore))}>{fitScore}%</span>
                        <span className={cn('text-[10px] px-1.5 py-px rounded capitalize', interestStyle(interest))}>
                            {interest}
                        </span>
                    </div>
                    <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', fitBar(fitScore))} style={{width: `${fitScore}%`}}/>
                    </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    {status === 'available' && (
                        <button
                            onClick={onOffer}
                            className="px-3 py-1.5 text-xs font-medium rounded bg-primary-light/15 dark:bg-primary-dark/15 text-primary-light dark:text-primary-dark hover:bg-primary-light/25 dark:hover:bg-primary-dark/25 ring-1 ring-primary-light/30 dark:ring-primary-dark/30 transition-colors"
                        >
                            Offer
                        </button>
                    )}
                    {status === 'offered' && (
                        <>
                            <button
                                onClick={onCommit}
                                disabled={committing}
                                className="px-3 py-1.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                            >
                                {committing ? '…' : 'Commit'}
                            </button>
                            <button
                                onClick={onWithdraw}
                                className="px-2 py-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                            >
                                ✕
                            </button>
                        </>
                    )}
                    {status === 'committed' && (
                        <span
                            className="text-[11px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded">
                            On Roster
                        </span>
                    )}
                </div>
            </div>

            {/* ── Expanded detail ── */}
            {expanded && (
                <div
                    className="px-4 pb-5 pt-3 border-t border-neutral-200 dark:border-neutral-700/60 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Key attributes */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Key Attributes</p>
                        <div className="flex flex-col gap-2.5">
                            {keyAttrs.map(a => <StatBar key={a.label} label={a.label} value={a.value}/>)}
                            <StatBar label="Consistency" value={ratings.consistency}/>
                            <StatBar label="Injury Resist." value={ratings.injuryResistance}/>
                        </div>
                    </div>

                    {/* Personality */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Personality</p>
                        <div className="flex flex-col gap-2">
                            <TraitBar label="Prestige Drive" value={p.prestige}/>
                            <TraitBar label="Location Flex" value={p.locationPreference}/>
                            <TraitBar label="Discipline" value={p.discipline}/>
                            <TraitBar label="Teamwork" value={p.teamwork}/>
                            <TraitBar label="Academics" value={p.academics}/>
                            <TraitBar label="Adaptability" value={p.adaptability}/>
                        </div>
                    </div>

                    {/* Type ratings + events */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Type Ratings</p>
                        <div className="flex flex-col gap-2.5 mb-4">
                            <StatBar label="Short Distance" value={ratings.shortDistanceOvr}/>
                            <StatBar label="Middle Distance" value={ratings.middleDistanceOvr}/>
                            <StatBar label="Long Distance" value={ratings.longDistanceOvr}/>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Events</p>
                        <div className="flex flex-wrap gap-1">
                            {recruit.eventTypes.cross_country.map(e => (
                                <span key={`xc-${e}`}
                                      className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/20">
                                    {e} (XC)
                                </span>
                            ))}
                            {recruit.eventTypes.track_field.map(e => (
                                <span key={`tf-${e}`}
                                      className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Your class panel ─────────────────────────────────────────────────────────

function YourClassPanel({
                            offered,
                            committed,
                            allRecruits,
                            ratingsCache,
                            fitScores,
                            onCommit,
                            onWithdraw,
                            committingId,
                        }: {
    offered: Set<number>;
    committed: Set<number>;
    allRecruits: Recruit[];
    ratingsCache: Map<number, DisplayRatings>;
    fitScores: Map<number, number>;
    onCommit: (r: Recruit) => Promise<void>;
    onWithdraw: (id: number) => void;
    committingId: number | null;
}) {
    const offeredList = allRecruits.filter(r => offered.has(r.recruitId));
    const committedList = allRecruits.filter(r => committed.has(r.recruitId));

    if (offeredList.length === 0 && committedList.length === 0) {
        return (
            <div
                className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-1">Your Class</h3>
                <p className="text-xs text-neutral-500">No offers sent yet.</p>
                <p className="text-xs text-neutral-400 mt-1">Browse recruits and send offers to build your class.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">Your Class</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                    {committedList.length} committed · {offeredList.length} offered
                </p>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {committedList.map(r => {
                    const ratings = ratingsCache.get(r.recruitId);
                    const ovr = ratings ? getPrimaryOvr(r, ratings) : 0;
                    const cat = getArchetypeCategory(r);
                    return (
                        <div key={r.recruitId} className="px-4 py-2.5 flex items-center gap-3">
                            <div className={cn('w-1.5 h-6 rounded-full shrink-0',
                                cat === 'distance' ? 'bg-green-500' : cat === 'sprint' ? 'bg-blue-500' : 'bg-purple-500'
                            )}/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-light dark:text-text-dark truncate">
                                    {r.firstName} {r.lastName}
                                </p>
                                <p className="text-[11px] text-neutral-500">{getArchetypeLabel(r)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span
                                    className={cn('text-xs font-mono font-bold tabular-nums', ovrBadge(ovr))}>{ovr}</span>
                                <span
                                    className="text-[10px] text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded ring-1 ring-green-500/20">✓</span>
                            </div>
                        </div>
                    );
                })}
                {offeredList.map(r => {
                    const ratings = ratingsCache.get(r.recruitId);
                    const ovr = ratings ? getPrimaryOvr(r, ratings) : 0;
                    const cat = getArchetypeCategory(r);
                    const isCommitting = committingId === r.recruitId;
                    return (
                        <div key={r.recruitId} className="px-4 py-2.5 flex items-center gap-3">
                            <div className={cn('w-1.5 h-6 rounded-full shrink-0 opacity-40',
                                cat === 'distance' ? 'bg-green-500' : cat === 'sprint' ? 'bg-blue-500' : 'bg-purple-500'
                            )}/>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-light dark:text-text-dark truncate">
                                    {r.firstName} {r.lastName}
                                </p>
                                <p className="text-[11px] text-neutral-500">{getArchetypeLabel(r)}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] font-mono text-neutral-400 tabular-nums">{ovr}</span>
                                <button
                                    onClick={() => onCommit(r)}
                                    disabled={isCommitting}
                                    className="text-[11px] px-2 py-1 rounded bg-green-600/20 text-green-600 dark:text-green-400 hover:bg-green-600/30 ring-1 ring-green-500/25 disabled:opacity-50 transition-colors"
                                >
                                    {isCommitting ? '…' : 'Commit'}
                                </button>
                                <button
                                    onClick={() => onWithdraw(r.recruitId)}
                                    className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors px-1"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Roster summary card ──────────────────────────────────────────────────────

function RosterCard({team, teamPlayers}: { team: Team; teamPlayers: Player[] }) {
    const graduating = teamPlayers.filter(p => p.year >= 4).length;
    const xcEligible = teamPlayers.filter(p => p.seasons.includes('cross_country')).length;

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Current Roster</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                    {label: 'Athletes', value: teamPlayers.length},
                    {label: 'Team OVR', value: team.ovr},
                    {label: 'Graduating', value: graduating},
                    {label: 'XC Eligible', value: xcEligible},
                ].map(({label, value}) => (
                    <div key={label} className="bg-neutral-100 dark:bg-neutral-800/50 rounded p-2">
                        <p className="text-base font-bold text-text-light dark:text-text-dark">{value}</p>
                        <p className="text-[11px] text-neutral-500">{label}</p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                <StatBar label="Sprint OVR" value={team.sprint_ovr}/>
                <StatBar label="Middle OVR" value={team.middle_ovr}/>
                <StatBar label="Distance OVR" value={team.long_ovr}/>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'sprint' | 'middle' | 'distance';
type SortKey = 'fit' | 'ovr' | 'potential';

export default function RecruitingPage() {
    const {game, players, userTeam, loading: contextLoading} = useGameContext();

    // Recruits live in their own store, load separately
    const [recruits, setRecruits] = useState<Recruit[]>([]);
    const [recruitsLoading, setRecruitsLoading] = useState(true);

    // Local mutable copies for optimistic UI updates after commits
    const [localGame, setLocalGame] = useState(game);
    const [localPlayers, setLocalPlayers] = useState(players ?? []);
    const [localTeam, setLocalTeam] = useState<Team | null>(userTeam);

    // Sync context into local state when it arrives
    useEffect(() => {
        if (game) setLocalGame(game);
    }, [game]);
    useEffect(() => {
        if (players) setLocalPlayers(players);
    }, [players]);
    useEffect(() => {
        if (userTeam) setLocalTeam(userTeam);
    }, [userTeam]);

    // UI state
    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    const [sortBy, setSortBy] = useState<SortKey>('fit');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [offered, setOffered] = useState<Set<number>>(new Set());
    const [committed, setCommitted] = useState<Set<number>>(new Set());
    const [committingId, setCommittingId] = useState<number | null>(null);

    // Load recruits once gameId is available
    useEffect(() => {
        if (!game?.gameId) return;
        let cancelled = false;
        setRecruitsLoading(true);
        loadRecruits(game.gameId)
            .then(data => {
                if (!cancelled) setRecruits(data ?? []);
            })
            .catch(err => console.error('Failed to load recruits:', err))
            .finally(() => {
                if (!cancelled) setRecruitsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [game?.gameId]);

    // Detect already-committed recruits from current session or previous sessions
    useEffect(() => {
        if (!localPlayers || !localTeam) return;
        const alreadyCommitted = new Set<number>(
            localPlayers
                .filter(p => p.recruitId != null && p.teamId === localTeam.teamId)
                .map(p => p.recruitId as number),
        );
        setCommitted(alreadyCommitted);
    }, [localPlayers, localTeam]);

    // ── Derived data ───────────────────────────────────────────────────────

    // Only show recruits still in game.recruits (not claimed by any team)
    const availablePool = useMemo(() => {
        const poolSet = new Set<number>(localGame?.recruits ?? []);
        return recruits.filter(r => poolSet.has(r.recruitId));
    }, [recruits, localGame?.recruits]);

    // Stable ratings cache — recomputed only when pool changes
    const ratingsCache = useMemo(() => {
        const map = new Map<number, DisplayRatings>();
        for (const r of availablePool) map.set(r.recruitId, getDisplayRatings(r));
        // Also cache committed recruits for the Your Class panel
        for (const r of recruits) {
            if (committed.has(r.recruitId) && !map.has(r.recruitId)) {
                map.set(r.recruitId, getDisplayRatings(r));
            }
        }
        return map;
    }, [availablePool, recruits, committed]);

    const teamPlayers = useMemo(
        () => localPlayers.filter(p => p.teamId === localTeam?.teamId && p.retiredYear === 0),
        [localPlayers, localTeam],
    );

    const fitScores = useMemo(() => {
        if (!localTeam) return new Map<number, number>();
        const map = new Map<number, number>();
        for (const r of availablePool) map.set(r.recruitId, calculateFitScore(r, localTeam));
        return map;
    }, [availablePool, localTeam]);

    const teamNeeds = useMemo(
        () => localTeam ? getTeamNeeds(localTeam, teamPlayers) : null,
        [localTeam, teamPlayers],
    );

    // Pool minus already-committed
    const uncommittedPool = useMemo(
        () => availablePool.filter(r => !committed.has(r.recruitId)),
        [availablePool, committed],
    );

    const filtered = useMemo(() => {
        let list = uncommittedPool;
        if (filterTab !== 'all') list = list.filter(r => getArchetypeCategory(r) === filterTab);
        return [...list].sort((a, b) => {
            if (sortBy === 'fit') return (fitScores.get(b.recruitId) ?? 0) - (fitScores.get(a.recruitId) ?? 0);
            if (sortBy === 'ovr') return (ratingsCache.get(b.recruitId)?.overall ?? 0) - (ratingsCache.get(a.recruitId)?.overall ?? 0);
            return (ratingsCache.get(b.recruitId)?.potential ?? 0) - (ratingsCache.get(a.recruitId)?.potential ?? 0);
        });
    }, [uncommittedPool, filterTab, sortBy, fitScores, ratingsCache]);

    // ── Actions ────────────────────────────────────────────────────────────

    const handleOffer = (r: Recruit) => setOffered(prev => new Set([...prev, r.recruitId]));

    const handleWithdraw = (id: number) => setOffered(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
    });

    const handleCommit = useCallback(async (recruit: Recruit) => {
        if (!localTeam || !localGame) return;
        setCommittingId(recruit.recruitId);
        try {
            const mutablePlayers = [...localPlayers];
            const mutableTeam: Team = {...localTeam, players: [...localTeam.players]};
            const mutableGame = {...localGame, recruits: [...(localGame.recruits ?? [])]};

            await commitRecruit(recruit, mutableTeam, mutableGame, mutablePlayers, localGame.gameId);

            setLocalTeam(mutableTeam);
            setLocalPlayers(mutablePlayers);
            setLocalGame(mutableGame);
            setCommitted(prev => new Set([...prev, recruit.recruitId]));
            setOffered(prev => {
                const n = new Set(prev);
                n.delete(recruit.recruitId);
                return n;
            });
        } catch (err) {
            console.error('Failed to commit recruit:', err);
        } finally {
            setCommittingId(null);
        }
    }, [localTeam, localGame, localPlayers]);

    const getStatus = (r: Recruit): OfferStatus => {
        if (committed.has(r.recruitId)) return 'committed';
        if (offered.has(r.recruitId)) return 'offered';
        return 'available';
    };

    // ── Render ─────────────────────────────────────────────────────────────

    if (contextLoading || recruitsLoading) {
        return (
            <div className="py-6 space-y-4">
                <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"/>
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"/>
                    ))}
                </div>
                <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"/>
            </div>
        );
    }

    if (!localGame || !localTeam) {
        return <p className="py-6 text-sm text-neutral-400">Unable to load game data.</p>;
    }

    if (availablePool.length === 0 && recruits.length === 0) {
        return (
            <div className="py-6">
                <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">Recruiting</h1>
                <p className="text-sm text-neutral-400">
                    No recruits have been generated yet. Recruits are created when you start a new game.
                </p>
            </div>
        );
    }

    const committedList = recruits.filter(r => committed.has(r.recruitId));
    const graduating = teamPlayers.filter(p => p.year >= 4).length;

    const TABS: { id: FilterTab; label: string }[] = [
        {id: 'all', label: `All (${uncommittedPool.length})`},
        {id: 'sprint', label: `Sprint (${uncommittedPool.filter(r => getArchetypeCategory(r) === 'sprint').length})`},
        {id: 'middle', label: `Middle (${uncommittedPool.filter(r => getArchetypeCategory(r) === 'middle').length})`},
        {
            id: 'distance',
            label: `Distance (${uncommittedPool.filter(r => getArchetypeCategory(r) === 'distance').length})`
        },
    ];

    return (
        <div className="py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-baseline gap-3">
                    <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">Recruiting</h1>
                    <span className="text-sm text-neutral-400 font-medium">
                        Class of {localGame.currentYear + 1}
                    </span>
                </div>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    {localTeam.college} {localTeam.teamName}
                    {' · '}
                    {offered.size} offer{offered.size !== 1 ? 's' : ''} out
                    {' · '}
                    {committedList.length} committed
                </p>
            </div>

            {/* Team needs */}
            {teamNeeds && (
                <NeedsStrip
                    needs={teamNeeds}
                    committed={committedList.length}
                    graduating={graduating}
                    rosterSize={teamPlayers.length}
                />
            )}

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-6">

                {/* ── Recruit pool ── */}
                <div
                    className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    {/* Toolbar */}
                    <div
                        className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700 gap-3 flex-wrap">
                        <div className="flex items-center gap-1 overflow-x-auto">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterTab(tab.id)}
                                    className={cn(
                                        'px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors',
                                        filterTab === tab.id
                                            ? 'bg-primary-light/15 dark:bg-primary-dark/15 text-primary-light dark:text-primary-dark ring-1 ring-primary-light/30 dark:ring-primary-dark/30'
                                            : 'text-neutral-500 hover:text-text-light dark:hover:text-text-dark hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] text-neutral-400">Sort:</span>
                            {(['fit', 'ovr', 'potential'] as SortKey[]).map(k => (
                                <button
                                    key={k}
                                    onClick={() => setSortBy(k)}
                                    className={cn(
                                        'text-[11px] px-2 py-1 rounded transition-colors',
                                        sortBy === k
                                            ? 'text-text-light dark:text-text-dark bg-neutral-200 dark:bg-neutral-700'
                                            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200',
                                    )}
                                >
                                    {k === 'fit' ? 'Fit' : k === 'ovr' ? 'OVR' : 'POT'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column headers */}
                    <div
                        className="grid px-4 py-2 border-b border-neutral-200/60 dark:border-neutral-700/60"
                        style={{gridTemplateColumns: '1fr 96px 60px 56px 110px 124px'}}
                    >
                        {['Recruit', 'Events', 'OVR', 'POT', 'Fit', ''].map(h => (
                            <span key={h} className="text-[10px] uppercase tracking-widest text-neutral-400">
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-sm text-neutral-400">No recruits in this category.</p>
                        </div>
                    ) : (
                        filtered.map(recruit => {
                            const ratings = ratingsCache.get(recruit.recruitId);
                            if (!ratings) return null;
                            return (
                                <RecruitRow
                                    key={recruit.recruitId}
                                    recruit={recruit}
                                    fitScore={fitScores.get(recruit.recruitId) ?? 0}
                                    ratings={ratings}
                                    status={getStatus(recruit)}
                                    expanded={expandedId === recruit.recruitId}
                                    onToggle={() => setExpandedId(p => p === recruit.recruitId ? null : recruit.recruitId)}
                                    onOffer={() => handleOffer(recruit)}
                                    onWithdraw={() => handleWithdraw(recruit.recruitId)}
                                    onCommit={() => handleCommit(recruit)}
                                    committing={committingId === recruit.recruitId}
                                />
                            );
                        })
                    )}
                </div>

                {/* ── Right panel ── */}
                <div className="flex flex-col gap-4">
                    <YourClassPanel
                        offered={offered}
                        committed={committed}
                        allRecruits={recruits}
                        ratingsCache={ratingsCache}
                        fitScores={fitScores}
                        onCommit={handleCommit}
                        onWithdraw={handleWithdraw}
                        committingId={committingId}
                    />
                    {localTeam && <RosterCard team={localTeam} teamPlayers={teamPlayers}/>}
                </div>
            </div>
        </div>
    );
}