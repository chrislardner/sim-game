import { Meet, Race, Schedule } from '@/types/schedule';
import { Team } from '@/types/team';

let meetIdCounter = 1;

export function generateSeasonSchedule(teams: Team[], seasonType: 'cross_country' | 'track_field'): Schedule[] {
    const schedules: Schedule[] = teams.map(team => ({ teamId: team.teamId, meets: [] }));

    // Generate 10 regular-season weeks
    for (let week = 1; week <= 10; week++) {
        const meetsForWeek = createMeetsForWeek(teams, seasonType);
        meetsForWeek.forEach(meet => {
            schedules.forEach(schedule => {
                if (meet.teams.some(team => team.teamId === schedule.teamId)) {
                    schedule.meets.push(meet);
                }
            });
        });
    }
    return schedules;
}

function createMeetsForWeek(teams: Team[], seasonType: 'cross_country' | 'track_field'): Meet[] {
    const teamPairs = getRandomTeamPairs(teams); // Helper to pair teams
    const meets: Meet[] = teamPairs.map(pair => createMeet(pair, seasonType));
    return meets;
}

function createMeet(teams: Team[], seasonType: 'cross_country' | 'track_field'): Meet {
    return {
        week: 1, // Placeholder for now
        meetId: meetIdCounter++,
        date: getNextMeetDate(), // Helper function for dates
        teams,
        races: createRacesForMeet(seasonType),
        meetType: seasonType,
    };
}

function createRacesForMeet(seasonType: 'cross_country' | 'track_field'): Race[] {
    const eventTypes = seasonType === 'cross_country' ? ['8k'] : ['100m', '200m', '400m', '800m', '1500m'];
    return eventTypes.map(eventType => ({
        eventType,
        heats: [], // Races can be filled in during simulation
        participants: [] // Initialize participants as an empty array
    }));
}

function getNextMeetDate(): string {
    // Example of generating dates - customize based on season needs
    const now = new Date();
    return new Date(now.setDate(now.getDate() + 7)).toISOString().slice(0, 10);
}

// Helper to create random team pairs for weekly meets
function getRandomTeamPairs(teams: Team[]): Team[][] {
    // Shuffle and pair teams randomly
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const pairs: Team[][] = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
    }
    return pairs;
}
