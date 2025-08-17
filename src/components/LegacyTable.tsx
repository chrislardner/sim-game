"use client";

import React from "react";
import Table, {ColumnDef as NewCol} from "./Table";

export type LegacyColumnDef<T> = {
    key: keyof T;
    label: string;
    className?: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
};

export type LegacyTableProps<T> = {
    data: T[];
    columns: LegacyColumnDef<T>[];
    linkColumns?: (keyof T)[];     // old prop name
    getRowLink?: (item: T) => string;
};

/** Map legacy props -> new core props */
export default function LegacyTable<T>({
                                           data,
                                           columns,
                                           linkColumns = [],
                                           getRowLink,
                                       }: LegacyTableProps<T>) {
    const mapped: NewCol<T>[] = columns.map((c, i) => ({
        id: typeof c.key === "string" ? String(c.key) : `${String(c.label).toLowerCase().replace(/\s+/g, "-")}-${i}`,
        field: c.key,
        label: c.label,
        className: c.className,
        sortable: c.sortable,
        render: c.render,
    }));

    return (
        <Table<T>
            data={data}
            columns={mapped}
            linkFields={linkColumns}
            getRowLink={getRowLink}
        />
    );
}
