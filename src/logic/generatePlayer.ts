import {raceTypes} from "@/constants/raceTypes";
import {Player, PlayerPersonality} from "@/types/player";
import {generate} from "facesjs";
import {generateRandomFullName} from "@/data/parseNames";
import {getNextPlayerId} from "@/data/storage";
import {generatePlayerRatings} from "./generatePlayerRatings";
import {SubArchetype} from "@/constants/subArchetypes";
import {generatePlayerInteractions} from "./generatePlayerInteractions";

function generateRandomPlayerYear() {
    const r = Math.random();
    if (r < 0.30) return 1;
    if (r < 0.55) return 2;
    if (r < 0.78) return 3;
    return 4;
}

export function generatePlayerFace() {
    const jersey = ["jersey", "jersey2", "jersey3", "jersey4", "jersey5"];
    const accessories = ["none", "headband", "headband-high"];

    return generate({
        accessories: {id: accessories[Math.floor(Math.random() * accessories.length)]},
        jersey: {id: jersey[Math.floor(Math.random() * jersey.length)]},
    }, {
        gender: 'male'
    });
}

export async function createPlayer(gameId: number, teamId: number, schoolYear: number, playerSubArchetype: SubArchetype, startYear: number): Promise<Player> {
    if (schoolYear === -1) {
        schoolYear = generateRandomPlayerYear();
    }
    const newPlayerId = await getNextPlayerId(gameId);
    const face = generatePlayerFace();

    const name = await generateRandomFullName();
    const seasons = generateSeasonTypes(playerSubArchetype);

    const playerInfo = generatePlayerRatings(newPlayerId, playerSubArchetype, schoolYear);

    const interactions = generatePlayerInteractions();

    return {
        playerId: newPlayerId,
        teamId,
        year: schoolYear,
        firstName: name.firstName,
        lastName: name.lastName,
        seasons,
        eventTypes: generateEventTypes(playerSubArchetype),
        playerArch: playerInfo.pa,
        face,
        gameId,
        playerRatings: playerInfo.pr,
        playerSubArchetype,
        retiredYear: 0,
        startYear: startYear,
        interactions,
        playerPersonality: generatePlayerPersonality(newPlayerId),
    };
}

export function generateSeasonTypes(playerSubArchetype: SubArchetype): ('track_field' | 'cross_country')[] {
    if (playerSubArchetype.num <= 6) {
        return ['track_field'];
    } else {
        return ['cross_country', 'track_field'];
    }
}

export function generateEventTypes(playerSubArchetype: SubArchetype): {
    cross_country: string[];
    track_field: string[]
} {
    const events = {
        cross_country: [] as string[],
        track_field: [] as string[]
    };
    if (playerSubArchetype.events.some(event => raceTypes.cross_country.includes(event))) {
        events.cross_country.push(...playerSubArchetype.events.filter(event => raceTypes.cross_country.includes(event)));
    }
    if (playerSubArchetype.events.some(event => raceTypes.track_field.includes(event))) {
        events.track_field.push(...playerSubArchetype.events.filter(event => raceTypes.track_field.includes(event)));
    }
    return events;
}

export function generatePlayerPersonality(playerId: number): PlayerPersonality {
    return {
        playerId,
        discipline: Math.random() * 100,
        strategy: Math.random() * 100,
        adaptability: Math.random() * 100,
        leadership: Math.random() * 100,
        teamwork: Math.random() * 100,
        experience: Math.random() * 100,
        academics: Math.random() * 100,
        prestige: Math.random() * 100,
        locationPreference: Math.random() * 100,
    }
}