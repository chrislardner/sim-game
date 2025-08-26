"use client";

import React, { useMemo } from "react";
import Table, { ColumnDef } from "@/components/Table";
import { ratingsToAttributes } from "@/types/ratingsToAttributes";
import {ATTR_NAMES, ATTR_PARAMS, type AttrName, RoleKey} from "@/constants/curves";
import type { Attributes, PlayerRatings } from "@/types/player";

type Row = {
    id: AttrName;
    attribute: AttrName;
    primary_role: RoleKey | "basic";
    value: number;
};

function humanize(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

function bar(value: number) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <div className="flex items-center gap-3">
            <span className="tabular-nums">{Math.round(pct)}</span>
            <div className="h-1.5 w-28 rounded bg-neutral-200 dark:bg-neutral-700">
                <div
                    className="h-1.5 rounded bg-primary-light dark:bg-primary-dark"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export default function PlayerRatingsTable({ ratings, title = "Attributes" }: {
  ratings: PlayerRatings;
  title?: string;
}) {
  const attributes: Attributes = useMemo(() => ratingsToAttributes(ratings), [ratings]);

  const rows: Row[] = useMemo(
    () =>
      ATTR_NAMES.map((name: AttrName) => ({
        id: name,
        attribute: name,
        primary_role: ATTR_PARAMS[name].primary_role,
        value: Number.isFinite(attributes[name]) ? attributes[name] : 0,
      })),
    [attributes]
  );

  const columns: ColumnDef<Row>[] = [
    {
      id: "attribute",
      field: "attribute",
      label: "Attribute",
      sortable: true,
      render: (r) => <span className="whitespace-nowrap">{humanize(r.attribute)}</span>,
    },
    // ... existing code ...
    {
      id: "primary_role",
      field: "primary_role",
      label: "Primary Role",
      className: "w-36",
      sortable: true,
      render: (r) => (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
          {humanize(r.primary_role)}
        </span>
      ),
    },
    // ... existing code ...
    {
      id: "value",
      field: "value",
      label: "Value",
      className: "w-48",
      sortable: true,
      render: (r) => bar(r.value),
    },
  ];

  const { overall, potential, typeRatings } = ratings;

  return (
    <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <SummaryChip label="Overall" value={overall} />
          <SummaryChip label="Potential" value={potential} />
          <SummaryChip label="Short OVR" value={typeRatings.shortDistanceOvr} />
          <SummaryChip label="Middle OVR" value={typeRatings.middleDistanceOvr} />
          <SummaryChip label="Long OVR" value={typeRatings.longDistanceOvr} />
        </div>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <Table<Row> data={rows} columns={columns} />
      </div>
    </section>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-md bg-neutral-100 dark:bg-neutral-700 px-3 py-1.5">
      <span className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
            <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
        {Math.round(Number(value) || 0)}
      </span>
        </div>
    );
}
