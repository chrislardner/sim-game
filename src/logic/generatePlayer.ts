import { raceTypes } from "@/constants/raceTypes";
import { Player } from "@/types/player";
import { generate } from "facesjs";
import { generateRandomFullName } from "../data/parseNames";
import { getNextPlayerId, savePlayer } from "@/data/storage";
import { generatePlayerRatings } from "./generatePlayerRatings";
import { subArchetype } from "@/constants/subArchetypes";

export async function createPlayer(gameId: number, teamId: number, year: number, playerSubArchetype: subArchetype): Promise<Player> {
    if (year === -1) {
        year = Math.random() < 0.5 ? 1 : (Math.random() < 0.5 ? 2 : (Math.random() < 0.5 ? 3 : 4))
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

    const playerInfo = generatePlayerRatings(newPlayerId, playerSubArchetype, year);

    const player: Player = {
        playerId: newPlayerId,
        teamId,
        year,
        firstName: name.firstName,
        lastName: name.lastName,
        seasons,
        eventTypes: generateEventTypes(playerSubArchetype),
        playerArch: playerInfo.pa,
        face,
        gameId,
        playerRatings: playerInfo.pr,
        playerSubArchetype,
    };

    await savePlayer(gameId, player); // Save player to IndexedDB
    return player;
}

function generateSeasonTypes(playerSubArchetype: subArchetype): ('track_field' | 'cross_country')[] {
    if (playerSubArchetype.num <= 6) {
        return ['track_field'];
    } else {
        return ['cross_country', 'track_field'];
    }
}

function generateEventTypes(playerSubArchetype: subArchetype): { cross_country: string[]; track_field: string[] } {
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

