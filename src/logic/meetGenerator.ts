import {Team} from '@/types/team';
import {Heat, Meet, Race} from '@/types/schedule';
import {raceTypes} from '@/constants/raceTypes';
import {SeasonGamePhase, SeasonType} from '@/constants/seasons';
import {getNextMeetId, getNextRaceId} from '@/data/storage';
import {Player} from '@/types/player';
import {populateRaceWithParticipants} from "@/logic/populateRaces";

export async function createMeet(teams: Team[], players: Player[], week: number, year: number, gameId: number): Promise<{
    meet: Meet, races: Race[]
}> {
    const map = mapWeekToGamePhase(week);
    const meetId = await getNextMeetId(gameId);
    const races = await createRacesForMeet(teams, players, gameId, map.season, meetId, year, week)
    const meet: Meet = {
        week,
        meetId,
        date: map.type === 'playoffs' ? 'Playoff Round' : 'Regular Season Meet',
        year,
        teams: teams.map(team => ({teamId: team.teamId, points: 0, has_five_racers: false})),
        races: races.map(r => r.raceId),
        season: map.season,
        type: map.type,
        gameId,
    };
    return {meet, races};
}

async function populateRaceWithParticipantsConditionally(teams: Team[], players: Player[], seasonType: "cross_country" | "track_field", eventType: string, firstOfSeason: boolean) {
    if (!firstOfSeason) return [] as Array<{
        playerId: number;
        playerTime: number;
        scoring: { points: number; team_top_five: boolean; team_top_seven: boolean };
    }>;
    return await populateRaceWithParticipants(teams, players, seasonType, eventType);
}

function computeHeats(seasonType: "cross_country" | "track_field", eventType: string, participantCount: number): Heat[] {
    let heats;

    if (seasonType === "track_field") {
        const sprintLike = new Set(["100m", "200m", "400m", "800m"]);
        const distLike = new Set(["1500m", "1,500m", "3000m", "3,000m", "5000m", "5,000m", "10000m", "10,000m",]);

        if (sprintLike.has(eventType)) {
            heats = Math.max(1, Math.ceil(participantCount / 8));
        } else if (distLike.has(eventType)) {
            heats = Math.max(1, Math.ceil(participantCount / 16));
        } else {
            // default lane/heat assumption
            heats = Math.max(1, Math.ceil(participantCount / 12));
        }
    } else {
        // cross-country: single mass start
        heats = 1;
    }

    const hs: Heat[] = Array.from({length: heats}, () => ({
        playerTimes: {}, players: [],
    }));

    let i = 0;
    for (let idx = 0; idx < participantCount; idx++) {
        hs[i].players.push(idx);
        i = (i + 1) % heats;
    }

    return hs;
}

function fillHeatPlayerIds(heats: Heat[], participantIds: number[]) {
    for (const h of heats) {
        h.players = h.players.map((idx) => participantIds[idx] ?? 0);
    }
}

export function fillHeatsForRace(seasonType: "cross_country" | "track_field", eventType: string, participants: {
    playerId: number;
    playerTime: number;
    scoring: { points: number; team_top_five: boolean; team_top_seven: boolean }
}[]) {

    const heats = computeHeats(seasonType, eventType, participants.length);
    fillHeatPlayerIds(heats, participants.map((p) => p.playerId));
    return heats;
}

export async function createRacesForMeet(teams: Team[], players: Player[], gameId: number, seasonType: "cross_country" | "track_field",
                                         meetId: number, year: number, week: number):
    Promise<Race[]> {

    const firstOfSeason = week == 1;

    const events = raceTypes[seasonType] ?? [];
    const out: Race[] = [];

    for (const eventType of events) {
        const participants = await populateRaceWithParticipantsConditionally(teams, players, seasonType, eventType, firstOfSeason);
        const heats = fillHeatsForRace(seasonType, eventType, participants);

        const raceId = await getNextRaceId(gameId);

        out.push({
            participants,
            eventType,
            heats,
            raceId,
            teams: teams.map((t) => ({teamId: t.teamId, points: 0})),
            meetId,
            gameId,
            year,
        });
    }
    return out;
}


export function mapWeekToGamePhase(gameWeek: number): { season: SeasonType, type: SeasonGamePhase } {
    if (gameWeek >= 1 && gameWeek <= 9) return {season: 'cross_country', type: 'regular'};
    if (gameWeek >= 10 && gameWeek <= 11) return {season: 'cross_country', type: 'playoffs'};
    if (gameWeek >= 12 && gameWeek <= 14) return {season: 'cross_country', type: 'offseason'};
    if (gameWeek >= 15 && gameWeek <= 24) return {season: 'track_field', type: 'regular'};
    if (gameWeek >= 25 && gameWeek <= 26) return {season: 'track_field', type: 'playoffs'};
    if (gameWeek >= 27 && gameWeek <= 29) return {season: 'track_field', type: 'offseason'};
    if (gameWeek >= 30 && gameWeek <= 39) return {season: 'track_field', type: 'regular'};
    if (gameWeek >= 40 && gameWeek <= 41) return {season: 'track_field', type: 'playoffs'};
    if (gameWeek >= 42 && gameWeek <= 52) return {season: 'track_field', type: 'offseason'};

    throw new Error('Invalid week number');
}
