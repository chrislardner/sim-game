import {PlayerArch, Recruit} from "@/types/player";
import {getNextRecruitId} from "@/data/storage";
import {SubArchetype} from "@/constants/subArchetypes";
import {generateRandomFullName} from "@/data/parseNames";
import {generatePlayerInteractions} from "@/logic/generatePlayerInteractions";
import {
    generateEventTypes,
    generatePlayerFace,
    generatePlayerPersonality,
    generateSeasonTypes
} from "@/logic/generatePlayer";
import {calculateSubArchetype} from "@/logic/calculateSubArchetype";
import {flags} from "@/logic/generatePlayerRatings";

export async function generateRecruits(numberOfRecruits: number, gameId: number, year: number): Promise<Recruit[]> {
    const recruits: Recruit[] = [];
    for (let i = 0; i < numberOfRecruits / 4; i++) {
        const recruitSubArchetype: SubArchetype = calculateSubArchetype(["cross_country", "track_field"]);
        const recruit: Recruit = await generateNewRecruit(gameId, year, recruitSubArchetype);
        recruits.push(recruit);
    }
    for (let i = 0; i < (3 * numberOfRecruits / 4); i++) {
        const recruitSubArchetype: SubArchetype = calculateSubArchetype(["track_field"]);
        const recruit: Recruit = await generateNewRecruit(gameId, year, recruitSubArchetype);
        recruits.push(recruit);
    }
    return recruits;
}

async function generateNewRecruit(gameId: number, year: number, recruitSubArchetype: SubArchetype): Promise<Recruit> {
    const newRecruitId = await getNextRecruitId(gameId);

    const face = generatePlayerFace();

    const name = await generateRandomFullName();
    const f = flags(recruitSubArchetype);
    const pa: PlayerArch = {isSprinter: f.spr, isMiddleDistance: f.mid, isLongDistance: f.lon};

    const interactions = generatePlayerInteractions();

    return {
        recruitId: newRecruitId,
        year,
        firstName: name.firstName,
        lastName: name.lastName,
        seasons: generateSeasonTypes(recruitSubArchetype),
        eventTypes: generateEventTypes(recruitSubArchetype),
        playerArch: pa,
        face: face,
        playerSubArchetype: recruitSubArchetype,
        races: [],
        recruitPersonality: generatePlayerPersonality(newRecruitId),
        interactions,
    }
}