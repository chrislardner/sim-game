import React from 'react';

interface PlayerAverageTimesTableProps {
    averageTimes: { [eventType: string]: { [year: number]: number, overall: number } };
}

const PlayerAverageTimesTable: React.FC<PlayerAverageTimesTableProps> = ({averageTimes}) => {
    const columns = [
        {key: 'eventType', label: 'Event Type'},
        {key: 'year', label: 'Year'},
        {key: 'averageTime', label: 'Average Time'},
    ];

    const data = Object.entries(averageTimes).flatMap(([eventType, times]) =>
        Object.entries(times).map(([year, averageTime]) => ({
            eventType,
            year: year === 'overall' ? 'Overall' : year,
            averageTime: averageTime.toFixed(2),
        }))
    );

    return (
        <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg mt-4 transition-colors">
            <h2 className="text-xl font-semibold text-accent mb-2">Player Average Times</h2>
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                    {columns.map(column => (
                        <th key={column.key} className="py-3 px-4 text-left text-gray-700 dark:text-gray-300">
                            {column.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                        {columns.map(column => (
                            <td key={column.key} className="py-3 px-4 text-gray-900 dark:text-gray-100">
                                {row[column.key as keyof typeof row]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerAverageTimesTable;