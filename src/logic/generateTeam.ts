import { getNextTeamId } from "@/data/idTracker";
import { saveTeamData } from "@/data/storage";
import { Team } from "@/types/team";

export function createTeam(gameId: number, year: number): Team {
    const newTeamId: number = getNextTeamId(gameId);
    const colleges = ['Knox College', 'Monmouth College', 'Illinois College',
         'Lake Forest College', 'Grinnell College', 'Cornell College',
          'Ripon College', 'Beloit College', 'Lawrence University', 'St. Norbert College',
           'Carroll University'];
    const regions = ['Midwest Region', 'West Region', 'South Region', 'East Region'];
    const conferences = ['Midwest Conferencee']

    const teamData: Team = {
        teamId: newTeamId,
        college: colleges[newTeamId % colleges.length],
        teamName: `Team ${newTeamId}`,
        gameId,
        players: [],
        points: 0,
        teamSchedule: { teamId: newTeamId, meets: [], year},
        conference: 'Midwest Conference',
        region: 'Midwest Region'
    };
    saveTeamData(gameId, teamData);
    return teamData;
}