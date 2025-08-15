import {Conference, School} from "@/types/regionals";

type CollegeEntry = School;

type ConferenceEntry = Conference;

let colleges: CollegeEntry[] = [];
let conferences: ConferenceEntry[] = [];
let isDataLoaded = false;

async function preloadMatchedData(): Promise<void> {
    try {
        const response = await fetch("divisions/DIII/d3_matched.json");
        const data = await response.json();

        if (!data || !Array.isArray(data.colleges) || !Array.isArray(data.conferences)) {
            throw new Error("Invalid matched data structure. Ensure the JSON file is correct.");
        }

        colleges = data.colleges;
        conferences = data.conferences;

        if (colleges.length === 0 || conferences.length === 0) {
            throw new Error("No colleges or conferences found in matched data.");
        }

        isDataLoaded = true;
    } catch (error) {
        console.error("Error during preloadMatchedData:", error);
    }
}

export async function getAllConferences(): Promise<ConferenceEntry[]> {
    if (!isDataLoaded) {
        await preloadMatchedData();
    }

    return conferences;
}

export function getConferenceById(conferenceId: number): ConferenceEntry | null {
    return conferences.find((conf) => conf.conferenceId === conferenceId) || null;
}

function getCollegeById(collegeId: number): CollegeEntry | null {
    return colleges.find((college) => college.collegeId === collegeId) || null;
}

export async function getCollegesByConferenceId(conferenceId: number): Promise<CollegeEntry[]> {
    try {
        if (!isDataLoaded) {
            await preloadMatchedData();
        }

        const generatedColleges: CollegeEntry[] = [];
        const conference = getConferenceById(conferenceId);
        if (!conference || !conference.teamIds) {
            throw new Error("Conference or teamIds not found.");
        }
        for (const teamId of conference.teamIds) {
            const generatedCollege = getCollegeById(teamId);
            if (generatedCollege) {
                generatedColleges.push(generatedCollege);
            }
        }

        return generatedColleges;
    } catch (error) {
        console.error("Error generating colleges from conference Id:", error);
        throw error;
    }
}
