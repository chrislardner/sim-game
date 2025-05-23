import {raceTypes} from "@/constants/raceTypes";
import {Player} from "@/types/player";
import {generate} from "facesjs";
import {generateRandomFullName} from "@/data/parseNames";
import {getNextPlayerId} from "@/data/storage";
import {generatePlayerRatings} from "./generatePlayerRatings";
import {SubArchetype} from "@/constants/subArchetypes";
import {generatePlayerInteractions} from "./generatePlayerInteractions";

function generateRandomPlayerYear() {
    return Math.random() < 0.5 ? 1 : (Math.random() < 0.5 ? 2 : (Math.random() < 0.5 ? 3 : 4))
}

export async function createPlayer(gameId: number, teamId: number, schoolYear: number, playerSubArchetype: SubArchetype, startYear: number, currentYear: number): Promise<Player> {
    if (schoolYear === -1) {
        schoolYear = generateRandomPlayerYear();
    }
    const newPlayerId = await getNextPlayerId(gameId);

    const jersey = ["jersey", "jersey2", "jersey3", "jersey4", "jersey5"];

    const accessories = ["none", "headband", "headband-high"];

    const face = generate({
        accessories: {id: accessories[Math.floor(Math.random() * accessories.length)]},
        jersey: {id: jersey[Math.floor(Math.random() * jersey.length)]},
    }, {
        gender: 'male'
    });

    const name = await generateRandomFullName();
    const seasons = generateSeasonTypes(playerSubArchetype);

    const playerInfo = generatePlayerRatings(newPlayerId, playerSubArchetype, schoolYear);

    const interactions = generatePlayerInteractions(playerInfo.pr, startYear, currentYear);

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
    };
}

function generateSeasonTypes(playerSubArchetype: SubArchetype): ('track_field' | 'cross_country')[] {
    if (playerSubArchetype.num <= 6) {
        return ['track_field'];
    } else {
        return ['cross_country', 'track_field'];
    }
}

function generateEventTypes(playerSubArchetype: SubArchetype): { cross_country: string[]; track_field: string[] } {
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
