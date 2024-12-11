import { Team } from '@/types/team';
import { YearlyLeagueSchedule, TeamSchedule, Meet } from '@/types/schedule';
import { mappedSeasonPhases } from '@/constants/seasonPhases';
import { createMeet } from './meetGenerator';
import { mapWeekToGamePhase } from './meetGenerator';

// Generate League Schedule
export async function generateYearlyLeagueSchedule(gameId: number, teams: Team[], year: number): Promise<YearlyLeagueSchedule> {
    const leagueSchedule: YearlyLeagueSchedule = {
        year,
        meets: []
    };
    const regularSeasonPhase = mappedSeasonPhases.regularCrossCountry;
    for (let week = regularSeasonPhase.startWeek; week <= regularSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, week, year);
        leagueSchedule.meets.push(...meetsForWeek);
    }
    const trackField1RegularSeasonPhase = mappedSeasonPhases.regularTrackField1;
    for (let week = trackField1RegularSeasonPhase.startWeek; week <= trackField1RegularSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, week, year);
        leagueSchedule.meets.push(...meetsForWeek);
    }

    const trackField2RegularSeasonPhase = mappedSeasonPhases.regularTrackField2;
    for (let week = trackField2RegularSeasonPhase.startWeek; week <= trackField2RegularSeasonPhase.endWeek; week++) {
        const meetsForWeek = await createMeetsForWeek(gameId, teams, week, year);
        leagueSchedule.meets.push(...meetsForWeek);
    }
    return leagueSchedule;
}

// Generate Meets for a Given Week
export async function createMeetsForWeek(gameId: number, teams: Team[],  week: number, year: number): Promise<Meet[]> {
    const teamGroups = groupTeams(teams, week);
    return Promise.all(teamGroups.map(async group => await createMeet(group, week, year, gameId)));
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

// Generate Individual Team Schedules from League Schedule
export function generateTeamSchedules(leagueSchedule: YearlyLeagueSchedule, teams: Team[], year: number): TeamSchedule[] {
    return teams.map(team => ({
        teamId: team.teamId,
        year,
        meets: leagueSchedule.meets
            .filter(meet => meet.teams.some(t => t.teamId === team.teamId))
            .map(meet => meet.meetId)
    }));
}
