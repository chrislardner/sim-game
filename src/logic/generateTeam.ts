import { generateCollegesbyConferenceId } from "@/data/parseSchools";
import { getNextTeamId } from "@/data/storage";
import { School } from "@/types/regionals";
import { Team } from "@/types/team";

export async function createTeamsForConference(gameId: number, year: number, conferenceId: number): Promise<Team[]> {
    const schools: School[] = await generateCollegesbyConferenceId(conferenceId);
    const teams: Team[] = [];
    for (let i = 0; i < schools.length; i++) {
        const team: Team = await createTeam(gameId, year, schools[i]);
        teams.push(team);
    }

    return teams;
}

export async function createTeam(gameId: number, year: number, school: School): Promise<Team> {
    const newTeamId: number = await getNextTeamId(gameId);


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
