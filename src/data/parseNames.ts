import Papa from "papaparse";

interface RawNameEntry {
    first_name: string;
    last_name: string;
    first_percent_thousand: string;
    last_percent_thousand: string;
}

type NameEntry = {
    firstName: string;
    lastName: string;
    firstNameRate: number;
    lastNameRate: number;
};

type WeightEntry = {
    cumulativeWeight: number;
    name: string;
};

class NameGenerator {
    private firstNameWeights: WeightEntry[] = [];
    private lastNameWeights: WeightEntry[] = [];
    private isDataLoaded = false;

    private capitalizeFirstLetter(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    async preloadCSV(): Promise<void> {
        try {
            const response = await fetch("/names/names.csv");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            const parsedData = await this.parseCSV(csvData);

            this.computeWeights(parsedData);
            this.isDataLoaded = true;
        } catch (error) {
            console.error("Error during preloadCSV:", error);
            throw error; // Rethrow to handle it in the calling code
        }
    }

    private async parseCSV(csvData: string): Promise<NameEntry[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<RawNameEntry>(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const cleanedData = this.processParseResults(results.data);
                    resolve(cleanedData);
                },
                error: (error: Error) => {
                    console.error("Error parsing CSV data:", error);
                    reject(error);
                },
            });
        });
    }

    private processParseResults(data: RawNameEntry[]): NameEntry[] {
        return data
            .filter(this.isValidEntry)
            .map(this.convertEntry.bind(this))
            .filter((entry): entry is NameEntry =>
                entry !== null && entry.firstNameRate > 0 && entry.lastNameRate > 0);
    }

    private isValidEntry(entry: RawNameEntry): boolean {
        const isValid = Boolean(
            entry.first_name &&
            entry.last_name &&
            entry.first_percent_thousand &&
            entry.last_percent_thousand
        );
        if (!isValid) {
            console.log("Invalid Entry (Missing Fields):", entry);
        }
        return isValid;
    }

    private convertEntry(entry: RawNameEntry): NameEntry | null {
        try {
            const cleanedEntry = {
                firstName: entry.first_name.trim(),
                lastName: this.capitalizeFirstLetter(entry.last_name.trim()),
                firstNameRate: parseFloat(entry.first_percent_thousand.replace("%", "")) || 0,
                lastNameRate: parseFloat(entry.last_percent_thousand.replace("%", "")) || 0,
            };
            if (cleanedEntry.firstNameRate === 0 || cleanedEntry.lastNameRate === 0) {
                console.log("Invalid Rate in Entry:", cleanedEntry);
            }
            return cleanedEntry;
        } catch (error) {
            console.error("Error Cleaning Entry:", entry, error);
            return null;
        }
    }

    private computeWeights(parsedData: NameEntry[]): void {
        let firstCumulative = 0;
        let lastCumulative = 0;

        this.firstNameWeights = parsedData.map((entry) => {
            firstCumulative += entry.firstNameRate;
            return {cumulativeWeight: firstCumulative, name: entry.firstName};
        });

        this.lastNameWeights = parsedData.map((entry) => {
            lastCumulative += entry.lastNameRate;
            return {cumulativeWeight: lastCumulative, name: entry.lastName};
        });

        if (this.firstNameWeights.length === 0 || this.lastNameWeights.length === 0) {
            throw new Error("Weights are empty. Check CSV parsing and data validity.");
        }
    }

    private getRandomNameFromWeights(weights: WeightEntry[]): string {
        const totalWeight = weights[weights.length - 1].cumulativeWeight;
        const randomWeight = Math.random() * totalWeight;

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

    async generateRandomFullName(): Promise<{ firstName: string; lastName: string }> {
        if (!this.isDataLoaded) {
            await this.preloadCSV();
        }

        if (this.firstNameWeights.length === 0 || this.lastNameWeights.length === 0) {
            throw new Error("Weights are empty. Ensure CSV data is valid and preloaded correctly.");
        }

        return {
            firstName: this.getRandomNameFromWeights(this.firstNameWeights),
            lastName: this.getRandomNameFromWeights(this.lastNameWeights)
        };
    }
}

export const nameGenerator = new NameGenerator();
export const generateRandomFullName = nameGenerator.generateRandomFullName.bind(nameGenerator);
