import {SubArchetype} from "@/constants/subArchetypes";
import {PlayerArch, PlayerRatings, TypeRatings} from "@/types/player";

interface Attributes {
    topSpeed: number;
    strength: number;
    explosiveness: number;
    acceleration: number;
    pacing: number;
    stamina: number;
    mentalToughness: number;
    endurance: number;
    speedStamina: number;
}

export function generatePlayerRatings(playerId: number, playerSubArchetype: SubArchetype, playerYear: number): {
    pr: PlayerRatings,
    pa: PlayerArch
} {

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
    } else if (playerSubArchetype.num == 4) {
        isMiddleDistance = true;
    } else if (playerSubArchetype.num >= 5 && playerSubArchetype.num <= 9) {
        isMiddleDistance = true;
        isLongDistance = true;
    } else if (playerSubArchetype.num == 10) {
        isLongDistance = true;
    } else if (playerSubArchetype.num >= 11) {
        isSprinter = true;
        isMiddleDistance = true;
        isLongDistance = true;
    }

    const generateAttribute = (values: { sprinter: number, middleDistance: number, longDistance: number }, floors: {
        sprinter: number,
        middleDistance: number,
        longDistance: number
    }) => {
        const potentialValues = [];
        if (isSprinter) potentialValues.push(Math.min(Math.max(Math.floor(Math.random() * values.sprinter), floors.sprinter), values.sprinter));
        if (isMiddleDistance) potentialValues.push(Math.min(Math.max(Math.floor(Math.random() * values.middleDistance), floors.middleDistance), values.middleDistance));
        if (isLongDistance) potentialValues.push(Math.min(Math.max(Math.floor(Math.random() * values.longDistance), floors.longDistance), values.longDistance));
        return potentialValues.length > 0 ? Math.max(...potentialValues) : 0;
    };

    const attributes = {
        topSpeed: generateAttribute({sprinter: 100, middleDistance: 75, longDistance: 50}, {
            sprinter: 50,
            middleDistance: 30,
            longDistance: 20
        }),
        strength: generateAttribute({sprinter: 100, middleDistance: 75, longDistance: 50}, {
            sprinter: 50,
            middleDistance: 30,
            longDistance: 20
        }),
        explosiveness: generateAttribute({sprinter: 100, middleDistance: 75, longDistance: 50}, {
            sprinter: 50,
            middleDistance: 30,
            longDistance: 20
        }),
        acceleration: generateAttribute({sprinter: 100, middleDistance: 75, longDistance: 50}, {
            sprinter: 50,
            middleDistance: 30,
            longDistance: 20
        }),
        speedStamina: generateAttribute({sprinter: 50, middleDistance: 100, longDistance: 50}, {
            sprinter: 20,
            middleDistance: 50,
            longDistance: 20
        }),
        pacing: generateAttribute({sprinter: 50, middleDistance: 75, longDistance: 100}, {
            sprinter: 20,
            middleDistance: 30,
            longDistance: 50
        }),
        stamina: generateAttribute({sprinter: 50, middleDistance: 75, longDistance: 100}, {
            sprinter: 20,
            middleDistance: 30,
            longDistance: 50
        }),
        mentalToughness: generateAttribute({sprinter: 50, middleDistance: 75, longDistance: 100}, {
            sprinter: 20,
            middleDistance: 30,
            longDistance: 50
        }),
        endurance: generateAttribute({sprinter: 50, middleDistance: 75, longDistance: 100}, {
            sprinter: 20,
            middleDistance: 30,
            longDistance: 50
        }),
    };

    const {
        topSpeed,
        strength,
        explosiveness,
        acceleration,
        speedStamina,
        pacing,
        stamina,
        mentalToughness,
        endurance
    } = attributes;

    const longDistanceOvr = calculateLongDistanceOvr(attributes, athleticism);
    const middleDistanceOvr = calculateMiddleDistanceOvr(attributes, athleticism);
    const shortDistanceOvr = calculateSprintingOvr(attributes, athleticism);

    const playerArch: PlayerArch = {isLongDistance, isMiddleDistance, isSprinter};

    const typeRatings = {longDistanceOvr, middleDistanceOvr, shortDistanceOvr};

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
            speedStamina,
            stamina,
            mentalToughness,
            topSpeed,
            typeRatings,
            // flexibility,
            // coordination,
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
    let ageModifier = 1;
    if (playerYear < 2) {
        ageModifier = 1.5;
    } else if (playerYear < 3) {
        ageModifier = 1.25;
    } else if (playerYear < 4) {
        ageModifier = 1.1;
    }
    return Math.floor(overall * ageModifier);
}

function calculateLongDistanceOvr(attributes: Attributes, athleticism: number): number {
    return Math.floor(
        (attributes.pacing * 0.15) +
        (attributes.stamina * 0.43) +
        (attributes.mentalToughness * 0.30) +
        (attributes.endurance * 0.01) +
        (attributes.topSpeed * 0.0) +
        (attributes.strength * 0.00) +
        (attributes.strength * 0.00) +
        (attributes.explosiveness * 0.00) +
        (attributes.acceleration * 0.05) +
        (athleticism * 0.01) +
        (attributes.speedStamina * 0.05)
    );
}

function calculateMiddleDistanceOvr(attributes: Attributes, athleticism: number): number {
    return Math.floor(
        (attributes.pacing * 0.15) +
        (attributes.stamina * 0.10) +
        (attributes.speedStamina * 0.40) +
        (attributes.mentalToughness * 0.05) +
        (attributes.endurance * 0.01) +
        (attributes.topSpeed * 0.10) +
        (attributes.strength * 0.02) +
        (attributes.explosiveness * 0.00) +
        (attributes.acceleration * 0.10) +
        (athleticism * 0.07)
    );
}

function calculateSprintingOvr(attributes: Attributes, athleticism: number): number {
    return Math.floor(
        (attributes.topSpeed * 0.43) +
        (attributes.strength * 0.05) +
        (attributes.explosiveness * 0.23) +
        (attributes.acceleration * 0.16) +
        (attributes.endurance * 0.01) +
        (attributes.pacing * 0.00) +
        (attributes.stamina * 0.00) +
        (attributes.mentalToughness * 0.00) +
        (athleticism * 0.11) +
        (attributes.speedStamina * 0.01)
    );
}
