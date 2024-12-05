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

export async function getAllColleges(): Promise<CollegeEntry[]> { 
    if (!isDataLoaded) {
        await preloadMatchedData();
    }

    return colleges;
}

export async function getAllConferences(): Promise<ConferenceEntry[]> {
    if (!isDataLoaded) {
        await preloadMatchedData();
    }

    return conferences;
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
export async function generateCollegesbyConferenceId(conferenceId: number): Promise<CollegeEntry[]> {
    try {
        if (!isDataLoaded) {
            await preloadMatchedData();
        }

        const generatedColleges: CollegeEntry[] = [];
        const conference = getConferenceById(conferenceId);
        if (!conference || !conference.teamIds) {
            throw new Error("Conference or teamIds not found.");
        }
        for (let i = 0; i < conference.teamIds.length; i++) {
            const generatedCollege = getCollegeById(conference.teamIds[i]);
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
