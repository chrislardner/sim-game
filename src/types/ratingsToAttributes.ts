import type {Attributes, PlayerRatings} from "@/types/player";
import {ATTR_NAMES, type AttrName} from "@/constants/curves";

export function ratingsToAttributes(r: PlayerRatings): Attributes {
    const a: Partial<Record<AttrName, number>> = {};
    for (const key of ATTR_NAMES) {
        const val = r[key];
        a[key] = Number.isFinite(val) ? (val as number) : 0;
    }
    return a as Attributes;
}
