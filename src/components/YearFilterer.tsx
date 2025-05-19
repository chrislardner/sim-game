"use client";

import { useState, useEffect } from "react";

interface YearFilterProps {
    availableYears: number[];
    currentYear: number;
    selectedYear: number | "all";
    onYearChangeAction: (year: number | "all") => void;
}

export default function YearFilter({ availableYears, currentYear, selectedYear, onYearChangeAction }: Readonly<YearFilterProps>) {
    const [years, setYears] = useState<number[]>([]);

    useEffect(() => {
        setYears([...new Set(availableYears)].sort((a, b) => b - a)); // Sort years in descending order
    }, [availableYears]);

    return (
        <div className="mb-4">
            <label htmlFor="year-select" className="text-lg font-medium mr-2 text-primary-light dark:text-primary-dark">
                Select Year:
            </label>
            <select
                id="year-select"
                className="border rounded px-3 py-2 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark"
                value={selectedYear}
                onChange={(e) => onYearChangeAction(e.target.value === "all" ? "all" : Number(e.target.value))}
            >
                <option value="all">All</option>
                {years.map(year => (
                    <option key={year} value={year}>
                        {year === currentYear ? `${year}` : year}
                    </option>
                ))}
            </select>
        </div>
    );
}
