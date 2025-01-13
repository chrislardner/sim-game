import { getCollegesbyConferenceId } from "@/data/parseSchools";
import { getNextTeamId } from "@/data/storage";
import { School } from "@/types/regionals";
import { Team } from "@/types/team";

export async function createTeamsForConference(gameId: number, year: number, conferenceId: number): Promise<Team[]> {
    const schools: School[] = await getCollegesbyConferenceId(conferenceId);
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
        throw new Error("Failed to assign a college to a team.");
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
