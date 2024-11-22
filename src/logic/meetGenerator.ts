import { Team } from '@/types/team';
import { Meet, Race } from '@/types/schedule';
import { getNextMeetId } from '@/data/idTracker';
import { raceTypes } from '@/constants/raceTypes';

export function createPlayoffMeet(teams: Team[], week: number, year: number, gameId: number): Meet {
    return {
        week,
        meetId: getNextMeetId(gameId),
        date: `Playoff Round`,
        year,
        teams: teams.map(team => team.teamId),
        races: createRacesForMeet(mapWeekToSeason(week)),
        season: mapWeekToSeason(week),
        type: 'playoff'
    };
}

function createRacesForMeet(seasonType: 'cross_country' | 'track_field'): Race[] {
    return raceTypes[seasonType].map(eventType => ({
        eventType,
        heats: [],
        participants: []
    }));
}

function mapWeekToGamePhase(gameWeek: number): string {
    if (gameWeek >= 1 && gameWeek <= 9) return 'regularCrossCountry';
    if (gameWeek >= 10 && gameWeek <= 12) return 'crossCountryPlayoffs';
    if (gameWeek >= 12 && gameWeek <= 14) return 'offseason';
    if (gameWeek >= 15 && gameWeek <= 24) return 'regularTrackField1';
    if (gameWeek >= 25 && gameWeek <= 27) return 'trackFieldPlayoffs1';
    if (gameWeek >= 28 && gameWeek <= 29) return 'offseason2';
    if (gameWeek >= 30 && gameWeek <= 39) return 'regularTrackField2';
    if (gameWeek >= 40 && gameWeek <= 42) return 'trackFieldPlayoffs2';
    if (gameWeek >= 43 && gameWeek <= 52) return 'offseason3';

    throw new Error('Invalid week number');
}

export function mapWeekToSeason(gameweek: number): 'cross_country' | 'track_field' {
    if (gameweek >= 1 && gameweek <= 14) return 'cross_country';
    if (gameweek >= 15 && gameweek <= 52) return 'track_field';

    throw new Error('Invalid week number');
}