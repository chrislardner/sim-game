import { Conference, School } from "@/types/regionals";

/* eslint-disable @typescript-eslint/no-unused-vars */
type CollegeEntry = School;

type ConferenceEntry = Conference;

let colleges: CollegeEntry[] = [];
let conferences: ConferenceEntry[] = [];
let isDataLoaded = false;

// Preload the matched.json file
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

// Get a conference by its ID
function getConferenceById(conferenceId: number): ConferenceEntry | null {
    return conferences.find((conf) => conf.conferenceId === conferenceId) || null;
}

// Get a college by its ID
function getCollegeById(collegeId: number): CollegeEntry | null {
    return colleges.find((college) => college.collegeId === collegeId) || null;
}

// Fetch a random college from the matched data
function getRandomCollege(): CollegeEntry | null {
    if (colleges.length === 0) {
        console.error("No colleges available. Ensure data is preloaded.");
        return null;
    }

    const randomIndex = Math.floor(Math.random() * colleges.length);
    return colleges[randomIndex];
}

// Fetch a random college from a specific conference
function getRandomCollegeFromConference(conferenceId: number): CollegeEntry | null {
    const conference = getConferenceById(conferenceId);
    if (!conference || conference.teamIds.length === 0) {
        console.error("No colleges found in this conference.");
        return null;
    }

    const teamIds = conference.teamIds;
    const randomTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
    return getCollegeById(randomTeamId);
}

// Generate a team with a random college
export async function generateRandomTeam(): Promise<CollegeEntry | null> {
    try {
        if (!isDataLoaded) {
            await preloadMatchedData();
        }

        const randomCollege = getRandomCollege();
        if (!randomCollege) {
            throw new Error("Failed to generate random college.");
        }

        return randomCollege;
    } catch (error) {
        console.error("Error generating random team:", error);
        throw error;
    }
}

// Generate multiple random colleges
export async function generateRandomCollegesBatch(count: number): Promise<CollegeEntry[]> {
    try {
        if (!isDataLoaded) {
            await preloadMatchedData();
        }

        const generatedColleges: CollegeEntry[] = [];
        for (let i = 0; i < count; i++) {
            const randomCollege = getRandomCollege();
            if (randomCollege) {
                generatedColleges.push(randomCollege);
            }
        }

        return generatedColleges;
    } catch (error) {
        console.error("Error generating random colleges batch:", error);
        throw error;
    }
}
