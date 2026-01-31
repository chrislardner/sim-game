"use client";

import type {ColumnDef} from "@/components/Table";
import type {ConferenceRow, SchoolRow} from "@/types/new-game";

export function buildConferenceColumns(opts: {
    selectedConferenceIds: Set<number>;
    toggleConference: (id: number) => void;
}): ColumnDef<ConferenceRow>[] {
    const {selectedConferenceIds, toggleConference} = opts;
    return [
        {
            id: "pick",
            label: "",
            sortable: false,
            className: "w-10",
            render: (r) => (
                <input
                    type="checkbox"
                    aria-label={`Select conference ${r.name}`}
                    checked={selectedConferenceIds.has(r.id)}
                    onChange={() => toggleConference(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 cursor-pointer"
                />
            ),
        },
        {id: "name", field: "name", label: "Conference", className: "min-w-[16rem]"},
        {
            id: "abbr",
            field: "abbr",
            label: "Abbr",
            className: "w-24",
            render: (r) => (
                <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {r.abbr}
        </span>
            ),
        },
        {id: "teamsCount", field: "teamsCount", label: "# Teams", className: "w-28"},
    ];
}

export function buildSchoolColumns(opts: {
    selectedSchoolId: number | null;
    selectSchool: (id: number) => void;
}): ColumnDef<SchoolRow>[] {
    const {selectedSchoolId, selectSchool} = opts;
    return [
        {
            id: "pick",
            label: "",
            sortable: false,
            className: "w-10",
            render: (r) => (
                <input
                    type="radio"
                    name="school"
                    aria-label={`Select school ${r.name}`}
                    checked={selectedSchoolId === r.id}
                    onChange={() => selectSchool(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 cursor-pointer"
                />
            ),
        },
        {id: "name", field: "name", label: "School", className: "min-w-[16rem]"},
        {id: "nickname", field: "nickname", label: "Nickname", className: "min-w-[10rem]"},
        {
            id: "abbr",
            field: "abbr",
            label: "Abbr",
            className: "w-24",
            render: (r) => (
                <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {r.abbr}
        </span>
            ),
        },
        {
            id: "conf",
            label: "Conference",
            field: "conferenceName",
            className: "min-w-[14rem]",
            render: (r) => (
                <span className="inline-flex items-center gap-2">
          <span>{r.conferenceName}</span>
          <span
              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            {r.conferenceAbbr}
          </span>
        </span>
            ),
        },
        {id: "city", field: "city", label: "City", className: "min-w-[10rem]"},
        {id: "state", field: "state", label: "State", className: "w-20"},
    ];
}
