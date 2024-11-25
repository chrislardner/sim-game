import { getNextTeamId } from "@/data/idTracker";
import { saveTeamData } from "@/data/storage";
import { Team } from "@/types/team";

export function createTeam(gameId: number, year: number): Team {
    const newTeamId: number = getNextTeamId(gameId);
    const college = chooseCollege();

    const teamData: Team = {
        teamId: newTeamId,
        college,
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
const colleges = [
    'Knox College', 'Monmouth College', 'Illinois College',
    'Lake Forest College', 'Grinnell College', 'Cornell College',
    'Ripon College', 'Beloit College', 'Lawrence University', 'St. Norbert College',
    'Carroll University'
];
const usedColleges = new Set<string>();

function chooseCollege(): string {
    if (usedColleges.size >= colleges.length) {
        throw new Error("No more colleges available to choose from.");
    }

    let college: string;
    do {
        const randomIndex = Math.floor(Math.random() * colleges.length);
        college = colleges[randomIndex];
    } while (usedColleges.has(college));

    usedColleges.add(college);
    return college;
}
