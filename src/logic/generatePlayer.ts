import { raceTypes } from "@/constants/raceTypes";
import { getNextPlayerId } from "@/data/idTracker";
import { savePlayerData } from "@/data/storage";
import { Player } from "@/types/player";
import { generate } from "facesjs";
import { generateRandomFullName } from "./parseNames";

export async function createPlayer(gameId: number, teamId: number, year: number = Math.random() < 0.5 ? 1 : (Math.random() < 0.5 ? 2 : (Math.random() < 0.5 ? 3 : 4))): Promise<Player> {

    const newPlayerId = getNextPlayerId(gameId);

    const face = generate({
    }, {
        gender: 'male',
    });

    const name = await generateRandomFullName();
    const seasons = generateSeasonTypes();

    const player: Player = {
        playerId: newPlayerId,
        teamId,
        stats: {}, 
        personality: {},
        year,
        firstName: name.firstName,
        lastName: name.lastName,
        seasons,
        eventTypes: generateEventTypes(seasons),
        face
        };

    savePlayerData(gameId, player); // Save player to IndexedDB
    return player;
}

function generateSeasonTypes(): ('track_field' | 'cross_country')[] {
    const seasonTypes: ('track_field' | 'cross_country')[] = ['cross_country', 'track_field'];
    const selectedSeason = seasonTypes[Math.floor(Math.random() * seasonTypes.length)];
    if (selectedSeason === 'cross_country') {
        return ['cross_country', 'track_field'];
    }
    return [selectedSeason];
}

function generateEventTypes(seasonTypes: ('cross_country' | 'track_field')[]): { cross_country: string[]; track_field: string[] } {
    const events = {
        cross_country: [] as string[],
        track_field: [] as string[]
    };

    if (seasonTypes.includes('cross_country')) {
        events.cross_country.push(...raceTypes.cross_country);
        if (seasonTypes.includes('track_field')) {
            const trackEvents = Math.random() < 0.5 ? raceTypes.track_field.slice(4, 6) : raceTypes.track_field.slice(6, 8)
            events.track_field.push(...trackEvents);
        }
    } else if (seasonTypes.includes('track_field')) {
        const trackEvents = Math.random() < 0.5 ? raceTypes.track_field.slice(0, 2) : raceTypes.track_field.slice(2, 4);
        events.track_field.push(...trackEvents);
    }

    return events;
}