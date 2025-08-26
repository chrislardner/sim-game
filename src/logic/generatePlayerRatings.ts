import seedRandom from "seedrandom";
import { randomNormal } from "d3-random";
import { clamp } from "lodash";
import { ATTR_PARAMS, ATTR_NAMES, BLENDS, RARITY, AGE_SETS, type AttrName, type RoleKey } from "@/constants/curves";
import { sprintOvr, middleOvr, longOvr, playerOverall, potentialFromYear } from "@/logic/generatePlayerOverall";
import type { Attributes, PlayerArch, PlayerRatings, TypeRatings } from "@/types/player";
import { SubArchetype } from "@/constants/subArchetypes";

const Z = 1.6448536269514722; // 5th/95th percentile

const flags = (sub: SubArchetype) => {
    let spr = false, mid = false, lon = false;
    if (sub.num <= 2) spr = true;
    else if (sub.num >= 3 && sub.num <= 4) { spr = true; mid = true; }
    else if (sub.num === 5) mid = true;
    else if (sub.num >= 6 && sub.num <= 10) { mid = true; lon = true; }
    else if (sub.num === 11) lon = true;
    else if (sub.num >= 12) { spr = true; mid = true; lon = true; }
    return { spr, mid, lon } as const;
};

const roles = (f: ReturnType<typeof flags>): RoleKey[] => [
    ...(f.spr ? ["sprinter"] as const : []),
    ...(f.mid ? ["middle"] as const : []),
    ...(f.lon ? ["long"]   as const : []),
];

const blendKey = (rs: RoleKey[]) => (["sprinter","middle","long"] as const).filter(r => rs.includes(r)).join("+") as keyof typeof BLENDS;

const pickRarity = (rng: () => number) => {
    const r = rng(); let acc = 0;
    for (const tier of RARITY) { acc += tier.p; if (r <= acc) return tier }
    return RARITY[RARITY.length - 1];
};

export const ageFactor = (year: number, k: AttrName): number => {
    if (AGE_SETS.sprint.has(k)) {
        return year <= 1 ? 1.10 : year === 2 ? 1.18 : year === 3 ? 1.15 : 1.08;
    }
    if (AGE_SETS.middle.has(k)) {
        return year <= 1 ? 1.02 : year === 2 ? 1.10 : year === 3 ? 1.18 : 1.20;
    }
    if (AGE_SETS.long.has(k)) {
        return year <= 1 ? 1.00 : year === 2 ? 1.10 : year === 3 ? 1.20 : 1.25;
    }
    // basic (injuryResistance, consistency, recovery, athleticism)
    return year <= 1 ? 1.00 : year === 2 ? 1.05 : year === 3 ? 1.08 : 1.10;
};


const sigmaFromBounds = (low: number, high: number) => (high - low) / (2 * Z);

const sampleAttr = (rng: () => number, mean: number, sd: number, low: number, high: number) => {
    const normal = randomNormal.source(rng)(mean, sd);
    for (let i = 0; i < 12; i++) {
        const v = normal();
        if (v >= low && v <= high) return clamp(v, 0, 100);
    }
    return clamp(mean, 0, 100);
};

const genForRole = (rng: () => number, k: AttrName, role: RoleKey, rarity: {stdevScale:number; medianShift:number}, year: number) => {
    const p = ATTR_PARAMS[k][role];
    const mean = clamp(p.median + rarity.medianShift, p.low, p.high);
    const sd = (p.stdev ?? sigmaFromBounds(p.low, p.high)) * rarity.stdevScale;
    const raw = sampleAttr(rng, mean, sd, p.low, p.high);
    return clamp(raw * ageFactor(year, k), 0, 100);
};

const blendRoles = (vals: Partial<Record<RoleKey, number>>, weights: Record<RoleKey, number>) => {
    let num = 0, den = 0;
    (Object.keys(weights) as RoleKey[]).forEach(r => { if (weights[r] && vals[r] !== undefined) { num += (vals[r] as number) * weights[r]; den += weights[r]; } });
    return den ? num / den : 0;
};

export function generatePlayerRatings(
    playerId: number,
    playerSubArchetype: SubArchetype,
    playerYear: number
): { pr: PlayerRatings; pa: PlayerArch } {
    const f = flags(playerSubArchetype);
    const rs = roles(f);
    const w = BLENDS[blendKey(rs)];
    const rng = seedRandom.alea(`${playerId}-${playerSubArchetype.num}-${playerYear}`);
    const rarity = pickRarity(rng);

    const a = {} as Attributes;
    for (const k of ATTR_NAMES) {
        const byRole: Partial<Record<RoleKey, number>> = {};
        for (const r of rs) byRole[r] = genForRole(rng, k, r, rarity, playerYear);
        (a)[k] = blendRoles(byRole, w as Record<RoleKey, number>);
    }

    const typeRatings: TypeRatings = {
        shortDistanceOvr: sprintOvr(a),
        middleDistanceOvr: middleOvr(a),
        longDistanceOvr: longOvr(a),
    };

    const pa: PlayerArch = { isSprinter: f.spr, isMiddleDistance: f.mid, isLongDistance: f.lon };
    const overall = playerOverall(pa, typeRatings);
    const potential = potentialFromYear(playerYear, overall);

    const pr: PlayerRatings = {
        playerId,
        overall,
        potential,
        typeRatings,
        injuryResistance: a.injuryResistance,
        consistency: a.consistency,
        recovery: a.recovery,
        athleticism: a.athleticism,
        pacing: a.pacing,
        stamina: a.stamina,
        mentalToughness: a.mentalToughness,
        runningEconomy: a.runningEconomy,
        terrainAdaptability: a.terrainAdaptability,
        speedEndurance: a.speedEndurance,
        speedRecovery: a.speedRecovery,
        kickSpeed: a.kickSpeed,
        tactics: a.tactics,
        acceleration: a.acceleration,
        explosiveness: a.explosiveness,
        topSpeed: a.topSpeed,
        strength: a.strength,
        strideFrequency: a.strideFrequency,
    };

    return { pr, pa };
}
