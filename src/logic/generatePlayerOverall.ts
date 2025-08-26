import type { Attributes } from "@/types/player";
import type { PlayerArch, TypeRatings } from "@/types/player";

export const sprintOvr = (a: Attributes) =>
    Math.floor(a.topSpeed*0.45 + a.explosiveness*0.12 + a.acceleration*0.23 + a.strideFrequency*0.08 + a.strength*0.06 + a.athleticism*0.06);

export const middleOvr = (a: Attributes) =>
    Math.floor(a.speedEndurance*0.28 + a.kickSpeed*0.16 + a.pacing*0.14 + a.stamina*0.12 + a.acceleration*0.08 + a.topSpeed*0.08 + a.speedRecovery*0.06 + a.tactics*0.04 + a.athleticism*0.04);

export const longOvr = (a: Attributes) =>
    Math.floor(a.pacing*0.12 + a.stamina*0.37 + a.runningEconomy*0.20 + a.mentalToughness*0.14 + a.speedEndurance*0.06 + a.speedRecovery*0.04 + a.terrainAdaptability*0.01 + a.athleticism*0.01 + a.tactics*0.05);

export const playerOverall = (pa: PlayerArch, t: TypeRatings) => {
    let c = 0; if (pa.isSprinter) c++; if (pa.isMiddleDistance) c++; if (pa.isLongDistance) c++;
    const w = c ? 0.95 / c : 0; const spill = 0.05;
    let v = 0;
    if (pa.isSprinter) v += t.shortDistanceOvr * w;
    if (pa.isMiddleDistance) v += t.middleDistanceOvr * w;
    if (pa.isLongDistance) v += t.longDistanceOvr * w;
    v += ((t.shortDistanceOvr + t.middleDistanceOvr + t.longDistanceOvr) / 3) * spill;
    return Math.floor(Math.min(100, v));
};

export const potentialFromYear = (year: number, overall: number) =>
    Math.floor(Math.min(100, overall * (year <= 1 ? 1.1 : year === 2 ? 1.05 : year === 3 ? 1.025 : 1)));
