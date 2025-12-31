"use client";

import React from "react";

type Item = { k: string; v: React.ReactNode };

const ITEMS: Item[] = [
    {k: "Platform", v: "Browser"},
    { k: "Price",    v: "Free" },
];

export default function InfoBar() {
    return (
        <section className="container mx-auto px-4">
            <div
                className="
          rounded-2xl overflow-hidden shadow-sm
          ring-1 ring-neutral-900/10 dark:ring-white/10
          bg-white/60 dark:bg-neutral-900/40
          backdrop-blur supports-[backdrop-filter]:bg-white/50
          dark:supports-[backdrop-filter]:bg-neutral-900/40
        "
            >
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                    {ITEMS.map(({ k, v }) => (
                        <dl
                            key={k}
                            className="
                p-3 sm:p-4 md:p-5
                border-b last:border-b-0 md:border-b-0 md:border-r
                border-neutral-200/70 dark:border-neutral-800/70
              "
                        >
                            <dt className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 leading-none">
                                {k}
                            </dt>
                            <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                                {v}
                            </dd>
                        </dl>
                    ))}
                </div>
            </div>
        </section>
    );
}
