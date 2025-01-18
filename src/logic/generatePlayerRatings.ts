import { subArchetype } from "@/constants/subArchetypes";
import { PlayerRatings } from "@/types/player";

export function generatePlayerRatings(playerId: number, playerSubArchetype: subArchetype, playerYear: number): PlayerRatings {
    const strength = Math.floor(Math.random() * 100);
    const injuryResistance = Math.floor(Math.random() * 100);

    const consistency = Math.floor(Math.random() * 100);
    const endurance = Math.floor(Math.random() * 100);
    const athleticism = Math.floor(Math.random() * 100);

    const isSprinter = 0
    const isMiddleDistance = 0
    const isLongDistance = 0

    const longDistance = isLongDistance ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50);
    const pacing = isLongDistance ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50);
    const middleDistance = isMiddleDistance ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50);
    const sprinting = isSprinter ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50);
    const acceleration = isSprinter ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50);
    const explosiveness = isSprinter ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 50);

    const overall = calculatePlayerOverall(playerYear, strength, injuryResistance, endurance, athleticism, longDistance, pacing, middleDistance, sprinting, acceleration, explosiveness, playerSubArchetype);
    const potential = calculatePlayerPotential(playerYear, overall);
    
    const overall_clean = overall > 100? 100 : overall;
    const potential_clean = potential > 100? 100 : potential;

    return {
        playerId,
        strength,
        injuryResistance,
        potential: potential_clean,
        overall: overall_clean,
        consistency,
        endurance,
        athleticism,
        longDistance,
        pacing,
        middleDistance,
        sprinting,
        acceleration,
        explosiveness,
    };
}

function calculatePlayerOverall(playerYear: number, strength: number, injuryResistance: number, endurance: number, athleticism: number, longDistance: number, pacing: number, middleDistance: number, sprinting: number, acceleration: number, explosiveness: number, playerSubArchetype: subArchetype): number {
    const getridoflint = playerSubArchetype + playerYear.toString();
    if(playerYear == 0) {
        console.error("Player age is 0", getridoflint);
    }
    return Math.floor((strength + injuryResistance + endurance + athleticism + longDistance + pacing + middleDistance + sprinting + acceleration + explosiveness) / 10);
}

function calculatePlayerPotential(playerYear: number, overall: number): number {
    const ageModifier = playerYear < 2 ? 1.5 : playerYear < 3 ? 1.25 : playerYear < 4 ? 1.1 : 1;
    return Math.floor(overall * ageModifier);
}
