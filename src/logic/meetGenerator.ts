import { Team } from '@/types/team';
import { Meet, Race } from '@/types/schedule';
import { getNextMeetId, getNextRaceId } from '@/data/idTracker';
import { raceTypes } from '@/constants/raceTypes';

export function createPlayoffMeet(teams: Team[], week: number, year: number, gameId: number): Meet {
    return {
        week,
        meetId: getNextMeetId(gameId),
        date: `Playoff Round`,
        year,
        teams: teams.map(team => team.teamId),
        races: createRacesForMeet(gameId, mapWeekToSeason(week)),
        season: mapWeekToSeason(week),
        type: 'playoff'
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

export function mapWeekToSeason(gameweek: number): 'cross_country' | 'track_field' {
    if (gameweek >= 1 && gameweek <= 14) return 'cross_country';
    if (gameweek >= 15 && gameweek <= 52) return 'track_field';

    throw new Error('Invalid week number');
}