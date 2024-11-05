// src/logic/schedule.ts
import { Team } from '@/types/team';
import { Meet, Race, Heat } from '@/types/schedule';

let meetIdCounter = 1;

// Generate a schedule for each team
export function generateTeamSchedules(teams: Team[]): void {
    const allMeets: Meet[] = [];

    for (let week = 1; week <= 12; week++) {
        // Create a list of meets for this week
        const meetsThisWeek = generateWeeklyMeets(teams, week);
        allMeets.push(...meetsThisWeek);

        // Assign meets to each team’s schedule
        teams.forEach(team => {
            const teamMeets = meetsThisWeek.filter(meet => meet.teams.includes(team));
            teamMeets.forEach(meet => team.schedule.push(meet));
        });
    }
}

// Generate meets for a specific week
function generateWeeklyMeets(teams: Team[], week: number): Meet[] {
    const meets: Meet[] = [];

    for (let i = 0; i < teams.length; i += 2) {
        const participatingTeams: Team[] = teams.slice(i, i + 2);
        if (participatingTeams.length < 2) break;

        const isCrossCountry = week <= 8;
        const meetType: 'cross_country' | 'track_field' = isCrossCountry ? 'cross_country' : 'track_field';
        const races = generateRaces(meetType);

        const meet: Meet = {
            week,
            meetId: meetIdCounter++,
            teams: participatingTeams,
            date: `Week ${week}`,
            races,
            meetType: meetType,
        };

        meets.push(meet);
    }

    return meets;
}

// Generate races based on meet type
function generateRaces(meetType: 'cross_country' | 'track_field'): Race[] {
    if (meetType === 'cross_country') {
        return [{ eventType: '8k', heats: [], participants: [] }];
    }

    return [
        { eventType: '100m', heats: [], participants: [] },
        { eventType: '200m', heats: [], participants: [] },
        // Add additional track events as needed
    ];
}
