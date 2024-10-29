import { PlayoffSchedule, Meet } from '@/types/event';
import { Team } from '@/types/team';

let playoffRoundCounter = 1;
let meetIdCounter = 1; 

// Initialize playoffs
export function setupPlayoffs(teams: Team[]): PlayoffSchedule {
    const playoffTeams = teams.map(team => team.teamId); // Start with all teams
    return generatePlayoffRound(playoffTeams);
}

// Generate a playoff round with head-to-head matches
function generatePlayoffRound(teamIds: number[]): PlayoffSchedule {
    const matches: Meet[] = [];

    for (let i = 0; i < teamIds.length; i += 2) {
        const teamPair = teamIds.slice(i, i + 2);
        if (teamPair.length < 2) break;

        const meet: Meet = {
            meetId: meetIdCounter++,
            teams: teamPair,
            date: `Playoff Round ${playoffRoundCounter}`,
            races: [{ eventType: '8k', heats: [], participants: [] }], // Example race setup
            type: 'cross-country', // Set appropriate playoff meet type
        };
        matches.push(meet);
    }

    return {
        round: playoffRoundCounter++,
        matches,
        remainingTeams: teamIds,
    };
}

// Eliminate teams after each round
export function eliminateTeams(playoff: PlayoffSchedule, losingTeams: number[]): PlayoffSchedule {
    const remainingTeams = playoff.remainingTeams.filter(id => !losingTeams.includes(id));
    return generatePlayoffRound(remainingTeams);
}
