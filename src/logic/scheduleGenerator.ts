import {Team, TeamSchedule} from '@/types/team';
import {Meet, Race} from '@/types/schedule';
import {mappedSeasonPhases} from '@/constants/seasonPhases';
import {createMeet, mapWeekToGamePhase} from './meetGenerator';
import {Player} from '@/types/player';

// Generate League Schedule
export async function generateYearlyLeagueSchedule(gameId: number, teams: Team[], players: Player[], year: number): Promise<{
    meets: Meet[],
    races: Race[]
}> {
    const meets: Meet[] = [];
    const races: Race[] = [];
    const regularSeasonPhase = mappedSeasonPhases.regularCrossCountry;
    for (let week = regularSeasonPhase.startWeek; week <= regularSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, players, week, year);
        meets.push(...meetsForWeek.meets);
        races.push(...meetsForWeek.races);
    }
    const playoffSeasonPhase = mappedSeasonPhases.crossCountryPlayoffs;
    for (let week = playoffSeasonPhase.startWeek; week <= playoffSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, players, week, year);
        meets.push(...meetsForWeek.meets);
        races.push(...meetsForWeek.races);
    }
    const trackField1RegularSeasonPhase = mappedSeasonPhases.regularTrackField1;
    for (let week = trackField1RegularSeasonPhase.startWeek; week <= trackField1RegularSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, players, week, year);
        meets.push(...meetsForWeek.meets);
        races.push(...meetsForWeek.races);
    }
    const trackField1PlayoffSeasonPhase = mappedSeasonPhases.trackFieldPlayoffs1;
    for (let week = trackField1PlayoffSeasonPhase.startWeek; week <= trackField1PlayoffSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, players, week, year);
        meets.push(...meetsForWeek.meets);
        races.push(...meetsForWeek.races);
    }
    const trackField2RegularSeasonPhase = mappedSeasonPhases.regularTrackField2;
    for (let week = trackField2RegularSeasonPhase.startWeek; week <= trackField2RegularSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, players, week, year);
        meets.push(...meetsForWeek.meets);
        races.push(...meetsForWeek.races);
    }
    const trackField2PlayoffSeasonPhase = mappedSeasonPhases.trackFieldPlayoffs2;
    for (let week = trackField2PlayoffSeasonPhase.startWeek; week <= trackField2PlayoffSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, players, week, year);
        meets.push(...meetsForWeek.meets);
        races.push(...meetsForWeek.races);
    }
    return {meets, races};
}

// Generate Meets for a Given Week
export async function createMeetsForWeek(gameId: number, teams: Team[], players: Player[], week: number, year: number): Promise<{
    meets: Meet[],
    races: Race[]
}> {
    const teamGroups = groupTeams(teams, week);
    const results = await Promise.all(teamGroups.map(async group => await createMeet(group, players, week, year, gameId)));
    const meets = results.flatMap(result => result.meet);
    const races = results.flatMap(result => result.races);
    return {meets, races};
}

// Group Teams for Meets depending on the week and number of teams
function groupTeams(teams: Team[], week: number): Team[][] {
    const map = mapWeekToGamePhase(week);
    if (map.type === 'playoffs') {
        if (week === 10 || week === 25 || week === 40) {
            // First week of playoffs: group teams by conferenceId
            const groupsByConference: { [conferenceId: number]: Team[] } = {};
            teams.forEach(team => {
                if (!groupsByConference[team.conferenceId]) {
                    groupsByConference[team.conferenceId] = [];
                }
                groupsByConference[team.conferenceId].push(team);
            });
            return Object.values(groupsByConference);
        } else if (week === 11 || week === 26 || week === 41) {
            // Second week of playoffs: all teams in one meet
            return [teams];
        }
    }
    // Regular grouping
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const totalTeams = shuffledTeams.length;
    const groupSize = Math.ceil(Math.sqrt(totalTeams));
    const groups: Team[][] = [];
    for (let i = 0; i < totalTeams; i += groupSize) {
        groups.push(shuffledTeams.slice(i, i + groupSize));
    }

    // Ensure no group has less than 3 teams
    if (groups.length > 1) {
        for (let i = groups.length - 1; i >= 0; i--) {
            if (groups[i].length < 3) {
                const smallGroup = groups.splice(i, 1)[0];
                smallGroup.forEach((team, index) => {
                    groups[index % groups.length].push(team);
                });
            }
        }
    }
    return groups;
}

export function generateTeamSchedules(meets: Meet[], teams: Team[], year: number): TeamSchedule[] {

    return teams.map(team => ({
        teamId: team.teamId,
        year,
        meets: meets
            .filter(meet => meet.teams.some((t: { teamId: number }) => t.teamId === team.teamId))
            .map((meet: Meet) => meet.meetId)
    }));
}