import {SubArchetype, subArchetypeList} from "@/constants/subArchetypes";

export function calculateSubArchetype(seasons: ("cross_country" | "track_field")[]): SubArchetype {
    const hasXC = seasons.includes("cross_country");
    const hasTF = seasons.includes("track_field");

    const startIndex = hasXC && hasTF ? 6 : 0;
    const endIndex = hasXC && hasTF
        ? subArchetypeList.length - 1
        : Math.min(5, subArchetypeList.length - 1);

    if (startIndex > endIndex) {
        return subArchetypeList[subArchetypeList.length - 1];
    }

    const candidates = subArchetypeList.slice(startIndex, endIndex + 1);
    const totalWeight = candidates.reduce((sum, item) => sum + (item.chance ?? 0), 0);

    if (totalWeight <= 0) {
        return candidates[0];
    }

    let r = Math.random() * totalWeight;
    for (const item of candidates) {
        r -= (item.chance ?? 0);
        if (r <= 0) {
            return item;
        }
    }

    return candidates[candidates.length - 1];
}
