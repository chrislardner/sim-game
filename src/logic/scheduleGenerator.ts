// src/logic/scheduleGenerator.ts

import { Team } from '@/types/team';
import { LeagueSchedule, TeamSchedule, Meet, Race } from '@/types/schedule';
import { raceTypes } from '@/constants/raceTypes';

let meetIdCounter = 1;

// Generate the complete League Schedule for a season
export function generateLeagueSchedule(teams: Team[], seasonType: 'cross_country' | 'track_field'): LeagueSchedule {
    const leagueSchedule: LeagueSchedule = {
        seasonType,
        meets: []
    };

    // Generate a set number of weeks with meets
    for (let week = 1; week <= 10; week++) {
        const meetsForWeek = createMeetsForWeek(teams, seasonType, week);
        leagueSchedule.meets.push(...meetsForWeek);
    }

    return leagueSchedule;
}

// Generate meets for a specific week
function createMeetsForWeek(teams: Team[], seasonType: 'cross_country' | 'track_field', week: number): Meet[] {
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const teamPairs = pairTeams(shuffledTeams); // Helper function to pair teams
    const meets: Meet[] = teamPairs.map(pair => createMeet(pair, seasonType, week));

    return meets;
}

// Helper to pair teams
function pairTeams(teams: Team[]): Team[][] {
    const pairs: Team[][] = [];
    for (let i = 0; i < teams.length - 1; i += 2) {
        pairs.push([teams[i], teams[i + 1]]);
    }
    return pairs;
}

// Create a meet with seasonal race types
function createMeet(teams: Team[], seasonType: 'cross_country' | 'track_field', week: number): Meet {
    return {
        week,
        meetId: meetIdCounter++,
        date: `Week ${week}`,
        teams,
        races: createRacesForMeet(seasonType),
        meetType: seasonType
    };
}

// Create races based on the meet type (seasonal race types)
function createRacesForMeet(seasonType: 'cross_country' | 'track_field'): Race[] {
    const eventTypes = raceTypes[seasonType];
    return eventTypes.map(eventType => ({
        eventType,
        heats: [],
        participants: []
    }));
}

// Generate individual Team Schedules based on the League Schedule
export function generateTeamSchedules(leagueSchedule: LeagueSchedule, teams: Team[]): TeamSchedule[] {
    return teams.map(team => ({
        teamId: team.teamId,
        meets: leagueSchedule.meets.filter(meet => meet.teams.some(t => t.teamId === team.teamId)),
    }));
}
