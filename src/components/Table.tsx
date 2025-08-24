"use client";

import React, {useState} from "react";
import {FaSort, FaSortDown, FaSortUp} from "react-icons/fa";
import {useRouter} from "next/navigation";

type SortDir = "ascending" | "descending";
type SortConfig<T> = { field: keyof T; direction: SortDir } | null;

export type ColumnDef<T> = {
    id: string;
    field?: keyof T;
    label: string;
    className?: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
};

export type TableProps<T> = {
    data: T[];
    columns: ColumnDef<T>[];
    linkFields?: (keyof T)[];
    getRowLink?: (item: T) => string | undefined;
};

function compareValues(a: unknown, b: unknown) {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    const na = typeof a === "number" ? a : Number(a);
    const nb = typeof b === "number" ? b : Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    const sa = String(a).toLowerCase();
    const sb = String(b).toLowerCase();
    return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function getVal<T>(item: T, field?: keyof T) {
    if (!field) return undefined;
    return (item as Record<string, unknown>)[String(field)];
}

export default function Table<T>({
                                     data,
                                     columns,
                                     linkFields = [],
                                     getRowLink,
                                 }: TableProps<T>) {
    const [sort, setSort] = useState<SortConfig<T>>(null);
    const router = useRouter();
    const linkSet = new Set(linkFields.map(String));

    const sorted = [...data].sort((a, b) => {
        if (!sort) return 0;
        const av = getVal(a, sort.field);
        const bv = getVal(b, sort.field);
        const cmp = compareValues(av, bv);
        return sort.direction === "ascending" ? cmp : -cmp;
    });

    const toggleSort = (field?: keyof T, canSort?: boolean) => {
        if (!field || !canSort) return;
        setSort((prev) =>
            !prev || prev.field !== field
                ? { field, direction: "ascending" }
                : { field, direction: prev.direction === "ascending" ? "descending" : "ascending" }
        );
    };

    const sortIcon = (field?: keyof T) => {
        if (!field || !sort || sort.field !== field) return <FaSort />;
        return sort.direction === "ascending" ? <FaSortUp /> : <FaSortDown />;
    };

    return (
        <div className="p-2">
            <div className="block w-full max-w-full overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <tr>
                        {columns.map((c) => {
                            const canSort = c.sortable ?? Boolean(c.field);
                            return (
                                <th
                                    key={`h:${c.id}`}
                                    onClick={() => toggleSort(c.field, canSort)}
                                    className={`px-2 py-2 text-left text-xs font-small uppercase tracking-wider text-gray-500 ${c.className ?? ""} ${
                                        canSort ? "cursor-pointer select-none" : "cursor-default"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {c.label}
                                        {canSort && <span className="ml-2">{sortIcon(c.field)}</span>}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sorted.map((item, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${getRowLink ? "cursor-pointer" : ""}`}
                            onClick={
                                getRowLink
                                    ? () => {
                                        const href = getRowLink(item);
                                        if (href) router.push(href);
                                    }
                                    : undefined
                            }
                        >
                            {columns.map((c, colIdx) => {
                                if (c.render) {
                                    return (
                                        <td
                                            key={`c:${c.id}:${colIdx}`}
                                            className={`px-2 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-normal break-words ${c.className ?? ""}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {c.render(item)}
                                        </td>
                                    );
                                }
                                const val = getVal(item, c.field);
                                const isLink = c.field ? linkSet.has(String(c.field)) : false;
                                return (
                                    <td
                                        key={`c:${c.id}:${colIdx}`}
                                        className={`px-2 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-normal break-words ${c.className ?? ""}`}
                                        onClick={(e) => {
                                            if (isLink && getRowLink) {
                                                e.stopPropagation();
                                                const href = getRowLink(item);
                                                if (href) router.push(href);
                                            }
                                        }}
                                    >
                                        {isLink && getRowLink ? (
                                            <span className="text-blue-500 hover:underline">{String(val ?? "")}</span>
                                        ) : (
                                            String(val ?? "")
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
