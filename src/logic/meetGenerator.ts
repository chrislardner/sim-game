import { Team } from '@/types/team';
import { Heat, Meet, Race } from '@/types/schedule';
import { raceTypes } from '@/constants/raceTypes';
import { SeasonGamePhase, SeasonType } from '@/constants/seasons';
import { getNextMeetId, getNextRaceId } from '@/data/storage';

export async function createMeet(teams: Team[], week: number, year: number, gameId: number): Promise<Meet> {
    const map = mapWeekToGamePhase(week);
    return {
        week,
        meetId: await getNextMeetId(gameId),
        date: map.type === 'playoffs' ? 'Playoff Round' : 'Regular Season Meet',
        year,
        teams: teams.map(team => ({ teamId: team.teamId, points: 0, has_five_racers: false })),
        races: await createRacesForMeet(teams, gameId, map.season),
        season: map.season,
        type: map.type
    };
}

async function createRacesForMeet(teams: Team[], gameId: number, seasonType: 'cross_country' | 'track_field'): Promise<Race[]> {
    const races = await Promise.all(raceTypes[seasonType].map(async eventType => {
        const participants = teams.flatMap(team => 
            team.players.filter(player => 
                player.seasons.includes(seasonType) && player.eventTypes[seasonType].includes(eventType)
            ).map(player => ({ playerId: player.playerId, playerTime: 0, scoring: { points: 0, team_top_five: false, team_top_seven: false } }))
        );

        let heats = 1;
        if (seasonType === 'track_field') {
            if (['100m', '200m', '400m', '800m'].includes(eventType)) {
                heats = Math.ceil(participants.length / 8);
            } else if (['1,500m', '3,000m', '5,000m', '10,000m'].includes(eventType)) {
                heats = Math.ceil(participants.length / 16);
            }
        }
        const newHeats: Heat[] = Array.from({ length: heats }, () => ({ playerTimes: {}, players: [] }))
        participants.forEach((participant, index) => {
            const heatIndex = index % heats;
            newHeats[heatIndex].players.push(participant.playerId);
        });
        
        return {
            participants,
            eventType,
            heats: newHeats,
            raceId: await getNextRaceId(gameId),
            teams: teams.map(team => ({ teamId: team.teamId, points: 0 }))
        };
    }));
    return races;
}

export function mapWeekToGamePhase(gameWeek: number): { season: SeasonType, type: SeasonGamePhase } {
    if (gameWeek >= 1 && gameWeek <= 9) return { season: 'cross_country', type: 'regular' };
    if (gameWeek >= 10 && gameWeek <= 11) return { season: 'cross_country', type: 'playoffs' };
    if (gameWeek >= 12 && gameWeek <= 14) return { season: 'cross_country', type: 'offseason' };
    if (gameWeek >= 15 && gameWeek <= 24) return { season: 'track_field', type: 'regular' };
    if (gameWeek >= 25 && gameWeek <= 26) return { season: 'track_field', type: 'playoffs' };
    if (gameWeek >= 27 && gameWeek <= 29) return { season: 'track_field', type: 'offseason' };
    if (gameWeek >= 30 && gameWeek <= 39) return { season: 'track_field', type: 'regular' };
    if (gameWeek >= 40 && gameWeek <= 41) return { season: 'track_field', type: 'playoffs' };
    if (gameWeek >= 42 && gameWeek <= 52) return { season: 'track_field', type: 'offseason' };

    throw new Error('Invalid week number');
}
