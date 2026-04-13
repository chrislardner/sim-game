import {Player, PlayerPersonality, Recruit} from '@/types/player';
import {Team} from '@/types/team';
import {Game} from '@/types/game';
import {generatePlayerRatings} from '@/logic/generatePlayerRatings';
import {generatePlayerInteractions} from '@/logic/generatePlayerInteractions';
import {calculateTeamOvrs} from '@/logic/calculateTeamOvr';
import {getNextPlayerId, saveGame, savePlayer, saveTeam} from '@/data/storage';

export type ArchetypeCategory = 'sprint' | 'middle' | 'distance';

export interface NeedLevel {
    value: number;       // 0–100 urgency score
    label: 'High' | 'Medium' | 'Low';
}

export interface TeamNeeds {
    sprint: NeedLevel;
    middle: NeedLevel;
    distance: NeedLevel;
}

/**
 * Stable display-only ratings derived from recruitId as the RNG seed.
 * These are the "scouted" numbers a coach sees. The real PlayerRatings
 * generated on commit are seeded by the fresh playerId and may differ.
 */
export interface DisplayRatings {
    overall: number;
    potential: number;
    shortDistanceOvr: number;
    middleDistanceOvr: number;
    longDistanceOvr: number;
    stamina: number;
    pacing: number;
    mentalToughness: number;
    speedEndurance: number;
    kickSpeed: number;
    tactics: number;
    explosiveness: number;
    topSpeed: number;
    acceleration: number;
    consistency: number;
    injuryResistance: number;
}

// ─── Archetype helpers ────────────────────────────────────────────────────────

export function getArchetypeCategory(recruit: Recruit): ArchetypeCategory {
    const {playerArch} = recruit;
    if (playerArch.isSprinter && !playerArch.isLongDistance) return 'sprint';
    if (playerArch.isLongDistance && !playerArch.isSprinter) return 'distance';
    return 'middle';
}

export function getArchetypeLabel(recruit: Recruit): string {
    const {playerArch, seasons} = recruit;
    const isXC = seasons.includes('cross_country');

    if (playerArch.isLongDistance && !playerArch.isSprinter && !playerArch.isMiddleDistance) {
        return isXC ? 'Distance / XC' : 'Distance';
    }
    if (playerArch.isSprinter && !playerArch.isLongDistance && !playerArch.isMiddleDistance) {
        return 'Sprinter';
    }
    if (playerArch.isSprinter && playerArch.isMiddleDistance && !playerArch.isLongDistance) {
        return 'Sprint-Mid';
    }
    if (playerArch.isMiddleDistance && playerArch.isLongDistance && !playerArch.isSprinter) {
        return isXC ? 'Mid-Dist / XC' : 'Mid-Distance';
    }
    if (playerArch.isMiddleDistance) return 'Middle';
    return 'All-Around';
}

// ─── Display ratings ──────────────────────────────────────────────────────────

/**
 * Generates stable scouted ratings from recruitId as the RNG seed.
 * Calling this multiple times for the same recruit always returns the same values.
 */
export function getDisplayRatings(recruit: Recruit): DisplayRatings {
    const {pr} = generatePlayerRatings(recruit.recruitId, recruit.playerSubArchetype, 1);
    return {
        overall: pr.overall,
        potential: pr.potential,
        shortDistanceOvr: Math.round(pr.typeRatings.shortDistanceOvr),
        middleDistanceOvr: Math.round(pr.typeRatings.middleDistanceOvr),
        longDistanceOvr: Math.round(pr.typeRatings.longDistanceOvr),
        stamina: Math.round(pr.stamina),
        pacing: Math.round(pr.pacing),
        mentalToughness: Math.round(pr.mentalToughness),
        speedEndurance: Math.round(pr.speedEndurance),
        kickSpeed: Math.round(pr.kickSpeed),
        tactics: Math.round(pr.tactics),
        explosiveness: Math.round(pr.explosiveness),
        topSpeed: Math.round(pr.topSpeed),
        acceleration: Math.round(pr.acceleration),
        consistency: Math.round(pr.consistency),
        injuryResistance: Math.round(pr.injuryResistance),
    };
}

export function getPrimaryOvr(recruit: Recruit, ratings: DisplayRatings): number {
    const {playerArch} = recruit;
    if (playerArch.isLongDistance && !playerArch.isSprinter) return ratings.longDistanceOvr;
    if (playerArch.isSprinter && !playerArch.isLongDistance) return ratings.shortDistanceOvr;
    return ratings.middleDistanceOvr;
}

export function getKeyAttributes(
    recruit: Recruit,
    ratings: DisplayRatings,
): Array<{ label: string; value: number }> {
    if (recruit.playerArch.isLongDistance && !recruit.playerArch.isSprinter) {
        return [
            {label: 'Stamina', value: ratings.stamina},
            {label: 'Pacing', value: ratings.pacing},
            {label: 'Mental', value: ratings.mentalToughness},
        ];
    }
    if (recruit.playerArch.isSprinter && !recruit.playerArch.isLongDistance) {
        return [
            {label: 'Explosiveness', value: ratings.explosiveness},
            {label: 'Top Speed', value: ratings.topSpeed},
            {label: 'Acceleration', value: ratings.acceleration},
        ];
    }
    return [
        {label: 'Speed End.', value: ratings.speedEndurance},
        {label: 'Kick Speed', value: ratings.kickSpeed},
        {label: 'Tactics', value: ratings.tactics},
    ];
}

// ─── Fit score ────────────────────────────────────────────────────────────────

/**
 * 0–100 fit score using the recruit's existing recruitPersonality fields.
 *
 * 35% – positional need  (team's weakness in recruit's archetype category)
 * 30% – prestige match   (team.ovr vs recruit.prestige; large gaps hurt)
 * 20% – location flex    (locationPreference: 0 = local only, 100 = anywhere)
 * 15% – culture fit      ((discipline + teamwork) / 2)
 */
export function calculateFitScore(recruit: Recruit, team: Team): number {
    const p: PlayerPersonality = recruit.recruitPersonality;

    const needFit = getPositionalNeedFit(recruit, team);
    const prestigeDiff = Math.abs(team.ovr - p.prestige);
    const prestigeFit = Math.max(0, 100 - prestigeDiff * 1.4);
    const locationFit = p.locationPreference;
    const cultureFit = (p.discipline + p.teamwork) / 2;

    return Math.min(100, Math.max(0, Math.round(
        needFit * 0.35 + prestigeFit * 0.30 + locationFit * 0.20 + cultureFit * 0.15,
    )));
}

function getPositionalNeedFit(recruit: Recruit, team: Team): number {
    const {playerArch} = recruit;
    if (playerArch.isLongDistance && !playerArch.isSprinter) return Math.max(0, 100 - team.long_ovr);
    if (playerArch.isSprinter && !playerArch.isLongDistance) return Math.max(0, 100 - team.sprint_ovr);
    const relevant = [team.middle_ovr];
    if (playerArch.isSprinter) relevant.push(team.sprint_ovr);
    if (playerArch.isLongDistance) relevant.push(team.long_ovr);
    const avg = relevant.reduce((s, v) => s + v, 0) / relevant.length;
    return Math.max(0, 100 - avg);
}

export function getInterestLevel(fitScore: number): 'high' | 'medium' | 'low' {
    if (fitScore >= 68) return 'high';
    if (fitScore >= 42) return 'medium';
    return 'low';
}

// ─── Team needs ───────────────────────────────────────────────────────────────

/**
 * Urgency levels per archetype category, factoring in current team OVRs
 * and how many seniors are graduating (each grad adds 12 urgency points).
 */
export function getTeamNeeds(team: Team, teamPlayers: Player[]): TeamNeeds {
    const graduating = teamPlayers.filter(p => p.year >= 4);

    const sprintGrads = graduating.filter(
        p => p.playerArch.isSprinter && !p.playerArch.isLongDistance,
    ).length;
    const middleGrads = graduating.filter(
        p => p.playerArch.isMiddleDistance && !p.playerArch.isSprinter && !p.playerArch.isLongDistance,
    ).length;
    const distGrads = graduating.filter(
        p => p.playerArch.isLongDistance && !p.playerArch.isSprinter,
    ).length;

    const need = (ovr: number, grads: number): NeedLevel => {
        const urgency = Math.min(100, Math.max(0, 100 - ovr + grads * 12));
        return {value: urgency, label: urgency >= 60 ? 'High' : urgency >= 35 ? 'Medium' : 'Low'};
    };

    return {
        sprint: need(team.sprint_ovr, sprintGrads),
        middle: need(team.middle_ovr, middleGrads),
        distance: need(team.long_ovr, distGrads),
    };
}

// ─── Commit ───────────────────────────────────────────────────────────────────

/**
 * Converts a Recruit into a full Player on the user's team:
 *
 * 1. Allocates a real playerId and generates actual PlayerRatings for it.
 * 2. Builds a Player preserving the recruit's name, face, archetype, and personality.
 * 3. Sets player.recruitId so newYear.ts can detect pre-filled roster slots.
 * 4. Persists the Player, updates team.players, recalculates OVRs.
 * 5. Removes recruitId from game.recruits and persists game + team.
 */
export async function commitRecruit(
    recruit: Recruit,
    team: Team,
    game: Game,
    allPlayers: Player[],
    gameId: number,
): Promise<Player> {
    const newPlayerId = await getNextPlayerId(gameId);
    const {pr, pa} = generatePlayerRatings(newPlayerId, recruit.playerSubArchetype, 1);

    const player: Player = {
        playerId: newPlayerId,
        teamId: team.teamId,
        year: 1,
        firstName: recruit.firstName,
        lastName: recruit.lastName,
        seasons: recruit.seasons,
        eventTypes: recruit.eventTypes,
        playerArch: pa,
        face: recruit.face,
        gameId,
        playerRatings: pr,
        playerSubArchetype: recruit.playerSubArchetype,
        retiredYear: 0,
        startYear: game.currentYear,
        interactions: generatePlayerInteractions(),
        playerPersonality: recruit.recruitPersonality,
        recruitId: recruit.recruitId,   // links this player back to their recruit record
    };

    await savePlayer(gameId, player);

    if (!team.players.includes(player.playerId)) {
        team.players.push(player.playerId);
    }
    allPlayers.push(player);
    calculateTeamOvrs(team, allPlayers);

    game.recruits = (game.recruits ?? []).filter(id => id !== recruit.recruitId);

    await Promise.all([saveGame(game), saveTeam(gameId, team)]);

    return player;
}