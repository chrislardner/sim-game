"use client";

import {useMemo} from "react";
import {useGameContext} from "@/components/GameLayoutProvider";
import {Meet, Race} from "@/types/schedule";
import {Team} from "@/types/team";
import {Player} from "@/types/player";

export function useUserTeam(): Team | null {
    const {userTeam} = useGameContext();
    return userTeam;
}

export function useTeamPlayers(teamId?: number): Player[] {
    const {players} = useGameContext();
    return useMemo(() => {
        if (!players || !teamId) return [];
        return players.filter(p => p.teamId === teamId);
    }, [players, teamId]);
}

export function useUpcomingMeets(teamId?: number, limit: number = 5): Meet[] {
    const {game, meets} = useGameContext();
    return useMemo(() => {
        if (!meets || !game || !teamId) return [];
        return meets
            .filter(m => m.week >= game.currentWeek && m.year === game.currentYear)
            .filter(m => m.teams.some(t => t.teamId === teamId))
            .sort((a, b) => a.week - b.week)
            .slice(0, limit);
    }, [meets, game, teamId, limit]);
}

export function usePastMeets(teamId?: number, limit: number = 5): Meet[] {
    const {game, meets} = useGameContext();
    return useMemo(() => {
        if (!meets || !game || !teamId) return [];
        return meets
            .filter(m => m.week < game.currentWeek && m.year === game.currentYear)
            .filter(m => m.teams.some(t => t.teamId === teamId))
            .sort((a, b) => b.week - a.week)
            .slice(0, limit);
    }, [meets, game, teamId, limit]);
}

export function useMeetRaces(meetId?: number): Race[] {
    const {races} = useGameContext();
    return useMemo(() => {
        if (!races || !meetId) return [];
        return races.filter(r => r.meetId === meetId);
    }, [races, meetId]);
}

export function useCurrentSeason(): "cross_country" | "track_field" {
    const {game} = useGameContext();
    return useMemo(() => {
        if (!game) return "cross_country";
        // XC: weeks 1-11
        if (game.currentWeek <= 11) return "cross_country";
        return "track_field";
    }, [game]);
}

export function useStandings(season: "cross_country" | "track_field"): Team[] {
    const {teams} = useGameContext();
    return useMemo(() => {
        if (!teams) return [];
        return [...teams].sort((a, b) => {
            if (season === "cross_country") {
                return (b.xc_points || 0) - (a.xc_points || 0);
            }
            return (b.tf_points || 0) - (a.tf_points || 0);
        });
    }, [teams, season]);
}

export function useTeam(teamId?: number): Team | null {
    const {teams} = useGameContext();
    return useMemo(() => {
        if (!teams || !teamId) return null;
        return teams.find(t => t.teamId === teamId) ?? null;
    }, [teams, teamId]);
}

export function usePlayer(playerId?: number): Player | null {
    const {players} = useGameContext();
    return useMemo(() => {
        if (!players || !playerId) return null;
        return players.find(p => p.playerId === playerId) ?? null;
    }, [players, playerId]);
}

export function useIsUserTeam(teamId?: number): boolean {
    const {game} = useGameContext();
    return teamId === game?.selectedTeamId;
}

export function useNextMeet(): Meet | null {
    const {game} = useGameContext();
    const upcomingMeets = useUpcomingMeets(game?.selectedTeamId, 1);
    return upcomingMeets[0] ?? null;
}

export function usePreviousMeet(): Meet | null {
    const {game} = useGameContext();
    const pastMeets = usePastMeets(game?.selectedTeamId, 1);
    return pastMeets[0] ?? null;
}
