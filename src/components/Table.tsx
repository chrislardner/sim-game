import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

type SortConfig<T> = {
    key: keyof T;
    direction: 'ascending' | 'descending';
} | null;

type TableProps<T> = {
    data: T[];
    columns: { key: keyof T; label: string }[];
    getRowLink?: (item: T) => string;
    linkColumns?: (keyof T)[]; // New prop for specifying which columns should be links
};

const Table = <T,>({ data, columns, getRowLink, linkColumns = [] }: TableProps<T>) => {
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);
    const router = useRouter();

    if(!data) throw new Error("data is null");

    const sortedData = [...data].sort((a, b) => {
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

    const requestSort = (key: keyof T) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof T) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <FaSort />;
        }
        if (sortConfig.direction === 'ascending') {
            return <FaSortUp />;
        }
        return <FaSortDown />;
    };

    return (
        <div className="p-2">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    onClick={() => requestSort(column.key)}
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        {column.label}
                                        <span className="ml-2">{getSortIcon(column.key)}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                {columns.map((column) => (
                                    <td key={String(column.key)} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {linkColumns.includes(column.key) && getRowLink ? (
                                            <span
                                                className="text-blue-500 hover:underline cursor-pointer"
                                                onClick={() => router.push(getRowLink(item))}
                                            >
                                                {String(item[column.key])}
                                            </span>
                                        ) : (
                                            String(item[column.key])
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;