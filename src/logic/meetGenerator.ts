import { Team } from '@/types/team';
import { Meet, Race } from '@/types/schedule';
import { getNextMeetId, getNextRaceId } from '@/data/idTracker';
import { raceTypes } from '@/constants/raceTypes';
import { SeasonGamePhase, SeasonType } from '@/constants/seasons';

export function createMeet(teams: Team[], week: number, year: number, gameId: number): Meet {
    const map = mapWeekToGamePhase(week);
    return {
        week,
        meetId: getNextMeetId(gameId),
        date: map.type === 'playoffs' ? 'Playoff Round' : 'Regular Season Meet',
        year,
        teams: teams.map(team => team.teamId),
        races: createRacesForMeet(gameId, map.season),
        season: map.season,
        type: map.type
    };
}

function createRacesForMeet(gameId: number, seasonType: 'cross_country' | 'track_field'): Race[] {
    return raceTypes[seasonType].map(eventType => ({
        eventType,
        heats: [],
        participants: [],
        raceId: getNextRaceId(gameId)
    }));
}

export function mapWeekToGamePhase(gameWeek: number): { season: SeasonType, type: SeasonGamePhase } {
    if (gameWeek >= 1 && gameWeek <= 9) return { season: 'cross_country', type: 'regular' };
    if (gameWeek >= 10 && gameWeek <= 12) return { season: 'cross_country', type: 'playoffs' };
    if (gameWeek >= 12 && gameWeek <= 14) return { season: 'cross_country', type: 'offseason' };
    if (gameWeek >= 15 && gameWeek <= 24) return { season: 'track_field', type: 'regular' };
    if (gameWeek >= 25 && gameWeek <= 27) return { season: 'track_field', type: 'playoffs' };
    if (gameWeek >= 28 && gameWeek <= 29) return { season: 'track_field', type: 'offseason' };
    if (gameWeek >= 30 && gameWeek <= 39) return { season: 'track_field', type: 'regular' };
    if (gameWeek >= 40 && gameWeek <= 42) return { season: 'track_field', type: 'playoffs' };
    if (gameWeek >= 43 && gameWeek <= 52) return { season: 'track_field', type: 'offseason' };

    throw new Error('Invalid week number');
}