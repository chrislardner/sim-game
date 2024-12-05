import { getNextTeamId } from "@/data/idTracker";
import { generateRandomTeam } from "@/data/teamLoader";
import { School } from "@/types/regionals";
import { Team } from "@/types/team";

export async function createTeam(gameId: number, year: number): Promise<Team> {
    const newTeamId: number = getNextTeamId(gameId);

    console.log("Creating team with ID:", newTeamId);

    const school: School | null = await generateRandomTeam();

    if (school === null || school.collegeId === -1) {
        console.error("Failed to assign a college to a team.");
        return {
            teamId: -1,
            college: "No College",
            teamName: "No Team",
            gameId,
            players: [],
            points: 0,
            teamSchedule: { teamId: -1, meets: [], year },
            conferenceId: -1,
            schoolId: -1,
            state: "Unknown",
            city: "Unknown"
        };
    }

    const teamData: Team = {
        teamId: newTeamId,
        college: school.collegeName,
        teamName: school.nickname,
        gameId,
        players: [],
        points: 0,
        teamSchedule: { teamId: newTeamId, meets: [], year},
        conferenceId: school.conferenceId,
        schoolId: school.collegeId,
        state: school.state,
        city: school.city
    };
    return teamData;
}
