import {getCollegesByConferenceId} from "@/data/parseSchools";
import {getNextTeamId} from "@/data/storage";
import {Conference, School} from "@/types/regionals";
import {Team} from "@/types/team";

export async function createTeamsForConference(gameId: number, year: number, conference: Conference, selectedCollegeId: number): Promise<Team[]> {
    const schools: School[] = await getCollegesByConferenceId(conference.conferenceId);
    const teams: Team[] = [];
    for (const school of schools) {
        let player_control = false;
        if (school.collegeId === selectedCollegeId) {
            player_control = true;
        }
        const team: Team = await createTeam(gameId, year, school, player_control);
        teams.push(team);
    }

    return teams;
}

export async function createTeam(gameId: number, year: number, school: School, player_control: boolean): Promise<Team> {
    const newTeamId: number = await getNextTeamId(gameId);


    if (school === null || school.collegeId === -1) {
        throw new Error("Failed to assign a college to a team.");
    }

    return {
        teamId: newTeamId,
        college: school.collegeName,
        teamName: school.nickname,
        gameId,
        players: [],
        points: 0,
        teamSchedule: {teamId: newTeamId, meets: [], year},
        conferenceId: school.conferenceId,
        schoolId: school.collegeId,
        state: school.state,
        city: school.city,
        ovr: 0,
        sprint_ovr: 0,
        middle_ovr: 0,
        long_ovr: 0,
        xc_ovr: 0,
        abbr: school.collegeAbbr,
        player_control,
    };
}
