import { subArchetype } from "@/constants/subArchetypes";
import { PlayerRatings, TypeRatings, PlayerArch } from "@/types/player";

interface Attributes {
    topSpeed: number;
    strength: number;
    explosiveness: number;
    acceleration: number;
    pacing: number;
    stamina: number;
    mentalToughness: number;
    endurance: number;
}

export function generatePlayerRatings(playerId: number, playerSubArchetype: subArchetype, playerYear: number): {pr: PlayerRatings, pa: PlayerArch} {

    const injuryResistance = Math.floor(Math.random() * 100);
    const consistency = Math.floor(Math.random() * 100);
    const athleticism = Math.floor(Math.random() * 100);

    let isSprinter = false;
    let isMiddleDistance = false;
    let isLongDistance = false;

    if (playerSubArchetype.num <= 1) {
        isSprinter = true;
    } else if (playerSubArchetype.num >= 2 && playerSubArchetype.num <= 3) {
        isSprinter = true;
        isMiddleDistance = true;
    }
    else if (playerSubArchetype.num == 4) {
        isMiddleDistance = true;
    }
    else if (playerSubArchetype.num >= 5 && playerSubArchetype.num <= 9) {
        isMiddleDistance = true;
        isLongDistance = true;
    }
    else if (playerSubArchetype.num == 10) {
        isLongDistance = true;
    }
    else if (playerSubArchetype.num >= 11) {
        isSprinter = true;
        isMiddleDistance = true;
        isLongDistance = true;
    }

    const generateAttribute = (values: { sprinter: number, middleDistance: number, longDistance: number }) => {
        const potentialValues = [];
        if (isSprinter) potentialValues.push(Math.floor(Math.random() * values.sprinter));
        if (isMiddleDistance) potentialValues.push(Math.floor(Math.random() * values.middleDistance));
        if (isLongDistance) potentialValues.push(Math.floor(Math.random() * values.longDistance));
        return Math.max(...potentialValues);
    };

    const attributes = {
        topSpeed: generateAttribute({ sprinter: 100, middleDistance: 75, longDistance: 50 }),
        strength: generateAttribute({ sprinter: 100, middleDistance: 75, longDistance: 50 }),
        explosiveness: generateAttribute({ sprinter: 100, middleDistance: 75, longDistance: 50 }),
        acceleration: generateAttribute({ sprinter: 100, middleDistance: 75, longDistance: 50 }),
        pacing: generateAttribute({ sprinter: 50, middleDistance: 75, longDistance: 100 }),
        stamina: generateAttribute({ sprinter: 50, middleDistance: 75, longDistance: 100 }),
        mentalToughness: generateAttribute({ sprinter: 50, middleDistance: 75, longDistance: 100 }),
        endurance: generateAttribute({ sprinter: 50, middleDistance: 75, longDistance: 100 }),
    };

    const { topSpeed, strength, explosiveness, acceleration, pacing, stamina, mentalToughness, endurance } = attributes;

    const longDistanceOvr = calculateLongDistanceOvr(attributes, athleticism);
    const middleDistanceOvr = calculateMiddleDistanceOvr(attributes, athleticism);
    const shortDistanceOvr = calculateSprintingOvr(attributes, athleticism);

    const playerArch: PlayerArch = { isLongDistance, isMiddleDistance, isSprinter };

    const typeRatings = { longDistanceOvr, middleDistanceOvr, shortDistanceOvr };

    const overall = calculatePlayerOverall(playerArch, typeRatings);
    const potential = calculatePlayerPotential(playerYear, overall);

    const overall_clean = overall > 100 ? 100 : overall;
    const potential_clean = potential > 100 ? 100 : potential;

    return {
        pr: {
            playerId,
            strength,
            injuryResistance,
            potential: potential_clean,
            overall: overall_clean,
            consistency,
            endurance,
            athleticism,
            pacing,
            acceleration,
            explosiveness,
            stamina,
            mentalToughness,
            topSpeed,
            typeRatings,
        },
        pa: playerArch,
    };
}

function calculatePlayerOverall(pa: PlayerArch, t: TypeRatings): number {
    let overall = 0;
    let typeCount = 0;

    if (pa.isLongDistance) typeCount++;
    if (pa.isMiddleDistance) typeCount++;
    if (pa.isSprinter) typeCount++;

    const typeWeight = typeCount > 0 ? 0.95 / typeCount : 0;
    const otherWeight = 0.05;

    if (pa.isLongDistance) {
        overall += t.longDistanceOvr * typeWeight;
    }
    if (pa.isMiddleDistance) {
        overall += t.middleDistanceOvr * typeWeight;
    }
    if (pa.isSprinter) {
        overall += t.shortDistanceOvr * typeWeight;
    }

    overall += (t.longDistanceOvr + t.middleDistanceOvr + t.shortDistanceOvr) * otherWeight / 3;

    return Math.floor(overall);
}

function calculatePlayerPotential(playerYear: number, overall: number): number {
    const ageModifier = playerYear < 2 ? 1.5 : playerYear < 3 ? 1.25 : playerYear < 4 ? 1.1 : 1;
    return Math.floor(overall * ageModifier);
}

function calculateLongDistanceOvr(attributes: Attributes, athleticism: number): number {
    return Math.floor(
        (attributes.pacing * 0.15) +
        (attributes.stamina * 0.45) +
        (attributes.mentalToughness * 0.25) +
        (attributes.endurance * 0.01) +
        (attributes.topSpeed * 0.02) +
        (attributes.strength * 0.01) +
        (attributes.explosiveness * 0.00) +
        (attributes.acceleration * 0.01) +
        (athleticism * 0.1)
    );
}

function calculateMiddleDistanceOvr(attributes: Attributes, athleticism: number): number {
    return Math.floor(
        (attributes.pacing * 0.15) +
        (attributes.stamina * 0.22) +
        (attributes.mentalToughness * 0.1) +
        (attributes.endurance * 0.01) +
        (attributes.topSpeed * 0.15) +
        (attributes.strength * 0.02) +
        (attributes.explosiveness * 0.1) +
        (attributes.acceleration * 0.1) +
        (athleticism * 0.15)
    );
}

function calculateSprintingOvr(attributes: Attributes, athleticism: number): number {
    return Math.floor(
        (attributes.topSpeed * 0.33) +
        (attributes.strength * 0.1) +
        (attributes.explosiveness * 0.23) +
        (attributes.acceleration * 0.11) +
        (attributes.endurance * 0.01) +
        (attributes.pacing * 0.00) +
        (attributes.stamina * 0.00) +
        (attributes.mentalToughness * 0.01) +
        (athleticism * 0.21)
    );
}
