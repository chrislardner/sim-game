import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Team } from '../types/team';
import { Game } from '../types/game';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

type SortConfig = {
    key: keyof Team;
    direction: 'ascending' | 'descending';
} | null;

type TableProps = {
    teams: Team[];
    game: Game;
};

const Table: React.FC<TableProps> = ({ teams, game }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const router = useRouter();

    const sortedTeams = [...teams].sort((a, b) => {
        if (sortConfig !== null) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    });

    const requestSort = (key: keyof Team) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Team) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <FaSort />;
        }
        if (sortConfig.direction === 'ascending') {
            return <FaSortUp />;
        }
        return <FaSortDown />;
    };

    const handleRowClick = (teamId: number) => {
        router.push(`/teams/${teamId}`);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Teams</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {['college', 'teamName', 'conference', 'ovr', 'points', 'state', 'city', 'sprint_ovr', 'middle_ovr', 'long_ovr'].map((key) => (
                                <th
                                    key={key}
                                    onClick={() => requestSort(key as keyof Team)}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        {key.replace('_', ' ')}
                                        <span className="ml-2">{getSortIcon(key as keyof Team)}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedTeams.map(team => (
                            <tr key={team.teamId} className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleRowClick(team.teamId)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{team.college}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.teamName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{game.conferenceIdMap[team.conferenceId]}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.ovr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.points}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.state}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.city}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.sprint_ovr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.middle_ovr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{team.long_ovr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
