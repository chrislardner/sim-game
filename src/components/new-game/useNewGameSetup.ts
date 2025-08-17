"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllConferences, getCollegesByConferenceId } from "@/data/parseSchools";
import type { Conference, School } from "@/types/regionals";
import type { ConferenceRow, SchoolRow } from "@/types/new-game";

function setSignature(s: Set<number>) {
    return Array.from(s).sort((a, b) => a - b).join(",");
}

export function useNewGameSetup() {
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [loadingConfs, setLoadingConfs] = useState(false);
    const [loadingSchools, setLoadingSchools] = useState(false);
    const [selectedConferenceIds, setSelectedConferenceIds] = useState<Set<number>>(new Set());
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [numPlayers, setNumPlayers] = useState<number>(10);
    const [confSearch, setConfSearch] = useState("");
    const [schoolSearch, setSchoolSearch] = useState("");

    useEffect(() => {
        (async () => {
            setLoadingConfs(true);
            try {
                const list = await getAllConferences();
                setConferences(list ?? []);
            } finally {
                setLoadingConfs(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setLoadingSchools(true);
            try {
                const ids = Array.from(selectedConferenceIds);
                if (ids.length === 0) {
                    setSchools([]);
                    setSelectedSchoolId(null);
                    return;
                }
                const chunks = await Promise.all(ids.map((id) => getCollegesByConferenceId(id)));
                const flat = chunks.flat();
                const stillValid = selectedSchoolId && flat.some((s) => s.collegeId === selectedSchoolId);
                setSchools(flat);
                if (!stillValid) setSelectedSchoolId(null);
            } finally {
                setLoadingSchools(false);
            }
        })();
    }, [setSignature(selectedConferenceIds)]); // eslint-disable-line react-hooks/exhaustive-deps

    const confById = useMemo(() => {
        const m = new Map<number, Conference>();
        conferences.forEach((c) => m.set(c.conferenceId, c));
        return m;
    }, [conferences]);

    const conferenceRows: ConferenceRow[] = useMemo(() => {
        const q = confSearch.trim().toLowerCase();
        const base = conferences.map((c) => ({
            id: c.conferenceId,
            name: c.conferenceName,
            abbr: c.conferenceAbbr,
            teamsCount: c.teamIds?.length ?? 0,
        }));
        const filtered = q
            ? base.filter((r) => r.name.toLowerCase().includes(q) || r.abbr.toLowerCase().includes(q))
            : base;
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    }, [conferences, confSearch]);

    const schoolRows: SchoolRow[] = useMemo(() => {
        const q = schoolSearch.trim().toLowerCase();
        const base = schools.map((s) => {
            const conf = confById.get(s.conferenceId);
            return {
                id: s.collegeId,
                name: s.collegeName,
                nickname: s.nickname,
                abbr: s.collegeAbbr,
                conferenceName: conf?.conferenceName ?? "",
                conferenceAbbr: conf?.conferenceAbbr ?? "",
                city: s.city,
                state: s.state,
            };
        });
        const filtered = q
            ? base.filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    r.nickname.toLowerCase().includes(q) ||
                    r.abbr.toLowerCase().includes(q) ||
                    r.conferenceName.toLowerCase().includes(q) ||
                    r.conferenceAbbr.toLowerCase().includes(q) ||
                    r.city.toLowerCase().includes(q) ||
                    r.state.toLowerCase().includes(q)
            )
            : base;
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    }, [schools, schoolSearch, confById]);

    const toggleConference = useCallback((id: number) => {
        setSelectedConferenceIds((prev) => {
            const next = new Set(prev);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const selectSchool = useCallback((id: number) => {
        setSelectedSchoolId((prev) => (prev === id ? null : id));
    }, []);

    const resetForm = useCallback(() => {
        setSelectedConferenceIds(new Set());
        setSelectedSchoolId(null);
        setConfSearch("");
        setSchoolSearch("");
        setNumPlayers(10);
    }, []);

    const canSubmit = selectedConferenceIds.size > 0 && !!selectedSchoolId && numPlayers > 0;

    return {
        conferences,
        schools,
        conferenceRows,
        schoolRows,
        selectedConferenceIds,
        selectedSchoolId,
        numPlayers,
        setNumPlayers,
        confSearch,
        setConfSearch,
        schoolSearch,
        setSchoolSearch,
        loadingConfs,
        loadingSchools,
        toggleConference,
        selectSchool,
        resetForm,
        canSubmit,
    };
}
