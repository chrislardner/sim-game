import Papa from "papaparse";

type NameEntry = {
    firstName: string;
    lastName: string;
    firstNameRate: number;
    lastNameRate: number;
};

let firstNameWeights: { cumulativeWeight: number; name: string }[] = [];
let lastNameWeights: { cumulativeWeight: number; name: string }[] = [];
let isDataLoaded = false;

// Helper function to capitalize only the first letter
function capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Preload the CSV and compute cumulative weights
async function preloadCSV(): Promise<void> {
    try {
        const response = await fetch("/names/names.csv");
        const csvData = await response.text();

        const parsedData: NameEntry[] = await new Promise((resolve, reject) => {
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const cleanedData = results.data
                        .filter((entry: any) => {
                            const isValid = entry["first_name"] && 
                                            entry["last_name"] && 
                                            entry["first_percent_thousand"] && 
                                            entry["last_percent_thousand"];
                            if (!isValid) {
                                console.log("Invalid Entry (Missing Fields):", entry);
                            }
                            return isValid;
                        })
                        .map((entry: any) => {
                            try {
                                const cleanedEntry = {
                                    firstName: entry["first_name"].trim(),
                                    lastName: capitalizeFirstLetter(entry["last_name"].trim()),
                                    firstNameRate: parseFloat(entry["first_percent_thousand"].replace("%", "")) || 0,
                                    lastNameRate: parseFloat(entry["last_percent_thousand"].replace("%", "")) || 0,
                                };
                                if (cleanedEntry.firstNameRate === 0 || cleanedEntry.lastNameRate === 0) {
                                    console.log("Invalid Rate in Entry:", cleanedEntry);
                                }
                                return cleanedEntry;
                            } catch (error) {
                                console.error("Error Cleaning Entry:", entry, error);
                                return null;
                            }
                        })
                        .filter((entry: any) => entry !== null && entry.firstNameRate > 0 && entry.lastNameRate > 0);

                    resolve(cleanedData as NameEntry[]);
                },
                error: (error: any) => {
                    console.error("Error parsing CSV data:", error);
                    reject(error);
                },
            });
        });

        let firstCumulative = 0;
        let lastCumulative = 0;

        // Build cumulative weights for efficient random selection
        firstNameWeights = parsedData.map((entry) => {
            firstCumulative += entry.firstNameRate;
            return { cumulativeWeight: firstCumulative, name: entry.firstName };
        });

        lastNameWeights = parsedData.map((entry) => {
            lastCumulative += entry.lastNameRate;
            return { cumulativeWeight: lastCumulative, name: entry.lastName };
        });

        if (firstNameWeights.length === 0 || lastNameWeights.length === 0) {
            throw new Error("Weights are empty. Check CSV parsing and data validity.");
        }

        isDataLoaded = true;
    } catch (error) {
        console.error("Error during preloadCSV:", error);
    }
}

// Efficient weighted random selection
function getRandomNameFromWeights(
    weights: { cumulativeWeight: number; name: string }[]
): string {
    const totalWeight = weights[weights.length - 1].cumulativeWeight;
    const randomWeight = Math.random() * totalWeight;

    // Binary search for efficiency
    let low = 0;
    let high = weights.length - 1;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (weights[mid].cumulativeWeight < randomWeight) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    return weights[low].name;
}

// Generate a single random full name
export async function generateRandomFullName(): Promise<{ firstName: string; lastName: string }> {
    try {
        if (!isDataLoaded) {
            await preloadCSV();
        }

        if (firstNameWeights.length === 0 || lastNameWeights.length === 0) {
            throw new Error("Weights are empty. Ensure CSV data is valid and preloaded correctly.");
        }

        const firstName = getRandomNameFromWeights(firstNameWeights);
        const lastName = getRandomNameFromWeights(lastNameWeights);

        return { firstName, lastName };
    } catch (error) {
        console.error("Error generating random full name:", error);
        throw error;
    }
}

// Generate thousands of names in a batch
export async function generateRandomNamesBatch(count: number): Promise<{ firstName: string; lastName: string }[]> {
    try {
        await preloadCSV();

        const names: { firstName: string; lastName: string }[] = [];
        for (let i = 0; i < count; i++) {
            const firstName = getRandomNameFromWeights(firstNameWeights);
            const lastName = getRandomNameFromWeights(lastNameWeights);
            names.push({ firstName, lastName });
        }

        return names;
    } catch (error) {
        console.error("Error generating random names batch:", error);
        throw error;
    }
}

