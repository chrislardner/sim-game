"use client";

import {useMemo} from "react";
import Link from "next/link";
import {useGameContext} from "@/components/GameLayoutProvider";
import {cn} from "@/lib/cn";
import {Meet, Race} from "@/types/schedule";
import {Team} from "@/types/team";
import {Player} from "@/types/player";

function formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
}

function getTeamLineup(race: Race, teamId: number): number[] {
    // lineupsByTeam is Record<number, TeamLineup> - direct object lookup
    return race.lineupsByTeam?.[teamId]?.declared || [];
}

function SectionHeader({title, action}: { title: string; action?: { label: string; href: string } }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {title}
            </h2>
            {action && (
                <Link
                    href={action.href}
                    className="text-xs text-primary-light dark:text-primary-dark hover:underline"
                >
                    {action.label} →
                </Link>
            )}
        </div>
    );
}

function NextMeetSection({
                             meet,
                             races,
                             teams,
                             userTeamId,
                             gameId,
                         }: {
    meet: Meet;
    races: Race[];
    teams: Team[];
    userTeamId: number;
    gameId: number;
}) {
    const meetRaces = races.filter(r => r.meetId === meet.meetId);
    const teamsInMeet = meet.teams
        .map(mt => teams.find(t => t.teamId === mt.teamId))
        .filter((t): t is Team => t !== undefined);

    const racesWithLineups = meetRaces.filter(r => getTeamLineup(r, userTeamId).length > 0).length;
    const totalRaces = meetRaces.length;
    const lineupsComplete = racesWithLineups === totalRaces && totalRaces > 0;

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div
                        className="w-14 h-14 rounded-lg bg-primary-light/10 dark:bg-primary-dark/20 flex flex-col items-center justify-center">
                        <span className="text-xs text-primary-light dark:text-primary-dark font-medium">WEEK</span>
                        <span className="text-xl font-bold text-primary-light dark:text-primary-dark">{meet.week}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{meet.type}</h3>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {meet.season === "cross_country" ? "Cross Country" : "Track & Field"} · {teamsInMeet.length} teams
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {teamsInMeet.slice(0, 6).map(team => (
                                <span
                                    key={team.teamId}
                                    className={cn(
                                        "px-1.5 py-0.5 text-xs rounded",
                                        team.teamId === userTeamId
                                            ? "bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark font-medium"
                                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500"
                                    )}
                                >
                                    {team.abbr}
                                </span>
                            ))}
                            {teamsInMeet.length > 6 && (
                                <span
                                    className="px-1.5 py-0.5 text-xs text-neutral-400">+{teamsInMeet.length - 6}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Link
                        href={`/games/${gameId}/team/${userTeamId}/lineups`}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            lineupsComplete
                                ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                : "bg-primary-light dark:bg-primary-dark text-white hover:opacity-90"
                        )}
                    >
                        {lineupsComplete ? "Edit Lineups" : "Set Lineups"}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            lineupsComplete ? "bg-green-500" : "bg-amber-500"
                        )}/>
                        <span className="text-neutral-500">
                            {lineupsComplete ? "Ready" : `${racesWithLineups}/${totalRaces} races set`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LastMeetSection({
                             meet,
                             races,
                             players,
                             teams,
                             userTeamId,
                             gameId,
                         }: {
    meet: Meet;
    races: Race[];
    players: Player[];
    teams: Team[];
    userTeamId: number;
    gameId: number;
}) {
    const meetRaces = races.filter(r => r.meetId === meet.meetId);

    const teamResults = meet.teams
        .map(mt => ({
            team: teams.find(t => t.teamId === mt.teamId),
            points: mt.points,
            isUser: mt.teamId === userTeamId
        }))
        .filter((t): t is { team: Team; points: number; isUser: boolean } => t.team !== undefined && t.points > 0)
        .sort((a, b) => meet.season === 'cross_country' ? a.points - b.points : b.points - a.points);

    const userPlacement = teamResults.findIndex(t => t.isUser) + 1;

    const userTeamResults = meetRaces.flatMap(race =>
        race.participants
            .filter(p => p.playerTime > 0)
            .map(p => {
                const player = players.find(pl => pl.playerId === p.playerId);
                return {...p, player, eventType: race.eventType};
            })
            .filter(p => p.player?.teamId === userTeamId)
    ).sort((a, b) => a.playerTime - b.playerTime).slice(0, 3);

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-text-light dark:text-text-dark">{meet.type}</h3>
                    <p className="text-sm text-neutral-500">Week {meet.week} Results</p>
                </div>
                {userPlacement > 0 && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        userPlacement === 1 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                            userPlacement <= 3 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                    )}>
                        {userPlacement === 1 ? "🥇 1st" : userPlacement === 2 ? "🥈 2nd" : userPlacement === 3 ? "🥉 3rd" : `${userPlacement}th`}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-neutral-500 mb-2">Team Standings</p>
                    <div className="space-y-1">
                        {teamResults.slice(0, 5).map((tr, idx) => (
                            <div
                                key={tr.team.teamId}
                                className={cn(
                                    "flex items-center justify-between py-1 px-2 rounded text-sm",
                                    tr.isUser && "bg-primary-light/5 dark:bg-primary-dark/10"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs text-neutral-400">{idx + 1}</span>
                                    <span className={cn(
                                        tr.isUser ? "font-medium text-primary-light dark:text-primary-dark" : "text-text-light dark:text-text-dark"
                                    )}>
                                        {tr.team.abbr}
                                    </span>
                                </div>
                                <span className="text-xs text-neutral-500 tabular-nums">{tr.points}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-neutral-500 mb-2">Your Top Performers</p>
                    {userTeamResults.length > 0 ? (
                        <div className="space-y-1">
                            {userTeamResults.map((result) => (
                                <div key={result.playerId} className="flex items-center justify-between py-1 text-sm">
                                    <div className="truncate">
                                        <span className="text-text-light dark:text-text-dark">
                                            {result.player?.firstName} {result.player?.lastName?.charAt(0)}.
                                        </span>
                                        <span className="text-xs text-neutral-400 ml-1">{result.eventType}</span>
                                    </div>
                                    <span className="text-xs font-mono text-green-600 dark:text-green-400 ml-2">
                                        {formatTime(result.playerTime)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400">No results</p>
                    )}
                </div>
            </div>

            <Link
                href={`/games/${gameId}/meets/${meet.meetId}`}
                className="inline-block mt-3 text-sm text-primary-light dark:text-primary-dark hover:underline"
            >
                View Full Results →
            </Link>
        </div>
    );
}

function TeamCard({team, players, gameId}: { team: Team; players: Player[]; gameId: number }) {
    const teamPlayers = players.filter(p => p.teamId === team.teamId);
    const avgOverall = teamPlayers.length > 0
        ? Math.round(teamPlayers.reduce((sum, p) => sum + p.playerRatings.overall, 0) / teamPlayers.length)
        : 0;

    const topPlayers = [...teamPlayers]
        .sort((a, b) => b.playerRatings.overall - a.playerRatings.overall)
        .slice(0, 4);

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <Link
                    href={`/games/${gameId}/team/${team.teamId}`}
                    className="font-semibold text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                    {team.college} {team.teamName}
                </Link>
            </div>

            <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-700">
                <div className="p-3 text-center">
                    <div className="text-lg font-bold text-text-light dark:text-text-dark">{teamPlayers.length}</div>
                    <div className="text-xs text-neutral-500">Athletes</div>
                </div>
                <div className="p-3 text-center">
                    <div className="text-lg font-bold text-text-light dark:text-text-dark">{avgOverall}</div>
                    <div className="text-xs text-neutral-500">Team OVR</div>
                </div>
                <div className="p-3 text-center">
                    <div className="text-lg font-bold text-text-light dark:text-text-dark">{team.xc_points || 0}</div>
                    <div className="text-xs text-neutral-500">Points</div>
                </div>
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 mb-2">Top Athletes</p>
                <div className="space-y-1.5">
                    {topPlayers.map((player) => (
                        <Link
                            key={player.playerId}
                            href={`/games/${gameId}/players/${player.playerId}`}
                            className="flex items-center justify-between py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 -mx-1 px-1 rounded text-sm"
                        >
                            <span className="text-text-light dark:text-text-dark">
                                {player.firstName} {player.lastName}
                            </span>
                            <span
                                className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                {player.playerRatings.overall}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="p-4 pt-0 flex gap-2">
                <Link
                    href={`/games/${gameId}/team/${team.teamId}/roster`}
                    className="flex-1 text-center py-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                >
                    Roster
                </Link>
                <Link
                    href={`/games/${gameId}/team/${team.teamId}/lineups`}
                    className="flex-1 text-center py-2 text-sm rounded-md bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 transition-opacity"
                >
                    Lineups
                </Link>
            </div>
        </div>
    );
}

function StandingsCard({teams, userTeamId, season, gameId}: {
    teams: Team[];
    userTeamId: number;
    season: "cross_country" | "track_field";
    gameId: number
}) {
    const sortedTeams = [...teams]
        .sort((a, b) => {
            const aPoints = season === "cross_country" ? (a.xc_points || 0) : (a.tf_points || 0);
            const bPoints = season === "cross_country" ? (b.xc_points || 0) : (b.tf_points || 0);
            return bPoints - aPoints;
        });

    const userRank = sortedTeams.findIndex(t => t.teamId === userTeamId) + 1;
    const displayTeams = sortedTeams.slice(0, 8);

    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-text-light dark:text-text-dark">
                        {season === "cross_country" ? "XC" : "T&F"} Standings
                    </h3>
                    {userRank > 0 && (
                        <p className="text-xs text-neutral-500 mt-0.5">You&#39;re ranked #{userRank}</p>
                    )}
                </div>
                <Link
                    href={`/games/${gameId}/standings`}
                    className="text-xs text-primary-light dark:text-primary-dark hover:underline"
                >
                    View All →
                </Link>
            </div>
            <div className="p-2">
                {displayTeams.map((team, idx) => {
                    const isUser = team.teamId === userTeamId;
                    const points = season === "cross_country" ? team.xc_points : team.tf_points;
                    return (
                        <div
                            key={team.teamId}
                            className={cn(
                                "flex items-center justify-between px-2 py-1.5 rounded text-sm",
                                isUser && "bg-primary-light/5 dark:bg-primary-dark/10"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "w-5 text-center text-xs font-medium",
                                    idx === 0 ? "text-amber-500" : idx === 1 ? "text-neutral-400" : idx === 2 ? "text-orange-400" : "text-neutral-400"
                                )}>
                                    {idx + 1}
                                </span>
                                <span className={cn(
                                    isUser ? "font-medium text-primary-light dark:text-primary-dark" : "text-text-light dark:text-text-dark"
                                )}>
                                    {team.abbr || team.teamName}
                                </span>
                            </div>
                            <span className="text-xs text-neutral-500 tabular-nums">{points || 0}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EmptyState({title, message}: { title: string; message: string }) {
    return (
        <div
            className="bg-surface-light dark:bg-surface-dark rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <p className="font-medium text-text-light dark:text-text-dark">{title}</p>
            <p className="text-sm text-neutral-500 mt-1">{message}</p>
        </div>
    );
}

export default function GameDashboard() {
    const {game, teams, meets, races, players, userTeam, loading} = useGameContext();

    const nextMeet = useMemo(() => {
        if (!meets || !game) return null;
        return meets
            .filter(m => m.week >= game.currentWeek && m.year === game.currentYear)
            .filter(m => m.teams.some(t => t.teamId === game.selectedTeamId))
            .sort((a, b) => a.week - b.week)[0] || null;
    }, [meets, game]);

    const previousMeet = useMemo(() => {
        if (!meets || !game) return null;
        return meets
            .filter(m => m.week < game.currentWeek && m.year === game.currentYear)
            .filter(m => m.teams.some(t => t.teamId === game.selectedTeamId))
            .sort((a, b) => b.week - a.week)[0] || null;
    }, [meets, game]);

    const currentSeason = useMemo((): "cross_country" | "track_field" => {
        if (!game) return "cross_country";
        return game.currentWeek <= 11 ? "cross_country" : "track_field";
    }, [game]);

    if (loading || !game || !teams || !races || !players) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={cn(
                            "h-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse",
                            i === 1 && "lg:col-span-2"
                        )}/>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <section>
                <SectionHeader
                    title="Next Meet"
                    action={nextMeet ? {label: "Schedule", href: `/games/${game.gameId}/schedule`} : undefined}
                />
                {nextMeet ? (
                    <NextMeetSection
                        meet={nextMeet}
                        races={races}
                        teams={teams}
                        userTeamId={game.selectedTeamId}
                        gameId={game.gameId}
                    />
                ) : (
                    <EmptyState title="No Upcoming Meets" message="Check back after the current season."/>
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {previousMeet && (
                        <section>
                            <SectionHeader
                                title="Last Meet Results"
                                action={{label: "All Meets", href: `/games/${game.gameId}/schedule`}}
                            />
                            <LastMeetSection
                                meet={previousMeet}
                                races={races}
                                players={players}
                                teams={teams}
                                userTeamId={game.selectedTeamId}
                                gameId={game.gameId}
                            />
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    {userTeam && (
                        <section>
                            <SectionHeader title="Your Team"/>
                            <TeamCard team={userTeam} players={players} gameId={game.gameId}/>
                        </section>
                    )}

                    <section>
                        <StandingsCard
                            teams={teams}
                            userTeamId={game.selectedTeamId}
                            season={currentSeason}
                            gameId={game.gameId}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
