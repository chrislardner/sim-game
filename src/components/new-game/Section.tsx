"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight } from "@/components/icons/ChevronRight";

type Props = {
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

export default function Section({
                                    title,
                                    subtitle,
                                    right,
                                    children,
                                    defaultOpen = true,
                                }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const sectionId = useMemo(() => `sec-${Math.random().toString(36).slice(2, 8)}`, []);
    return (
        <section className="bg-surface-light dark:bg-surface-dark rounded-lg shadow transition-colors">
            <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 p-4">
                <button
                    type="button"
                    className="group inline-flex items-center gap-2 text-left"
                    aria-controls={sectionId}
                    aria-expanded={open}
                    onClick={() => setOpen((x) => !x)}
                >
                    <span
                        className={`text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300
                        inline-flex transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                        aria-hidden="true"
                    >
            <ChevronRight />
          </span>
                    <div className="ml-1">
                        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 uppercase tracking-wide">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                </button>
                {right}
            </header>
            {open && <div id={sectionId}>{children}</div>}
        </section>
    );
}
