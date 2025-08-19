"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CONFIG } from "@/components/nav/config";
import { resolveNav } from "@/components/nav/resolve";
import type { NavItem, NavPage, NavSection } from "@/types/nav";
import { cn } from "@/lib/cn";
import { ChevronRight } from "@/components/icons/ChevronRight";

type Props = { gameId: string };

function isActiveExact(pathname: string, target: string) {
    return pathname === target;
}

export default function Sidebar({ gameId }: Props) {
    const pathname = usePathname();

    const items: NavItem[] = useMemo(
        () => (gameId ? resolveNav(NAV_CONFIG, gameId) : NAV_CONFIG),
        [gameId]
    );

    const allOpenDefaults = useMemo(() => {
        const d: Record<string, boolean> = {};
        items.forEach((it) => it.type === "section" && (d[(it as NavSection).label] = true));
        return d;
    }, [items]);

    const [open, setOpen] = useState<Record<string, boolean>>(allOpenDefaults);

    useEffect(() => {
        setOpen(allOpenDefaults);
    }, [allOpenDefaults, gameId]);

    useEffect(() => {
        setOpen((prev) => {
            const next = { ...prev };
            items.forEach((it) => {
                if (it.type === "section") {
                    const sec = it as NavSection;
                    const hasActive = sec.children.some((c) => isActiveExact(pathname, c.hrefTemplate));
                    if (hasActive) next[sec.label] = true;
                }
            });
            return next;
        });
    }, [pathname, items]);

    return (
        <aside
            role="navigation"
            aria-label="Sidebar"
            className={cn(
                "w-48 shrink-0 h-screen sticky top-0",
                "bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800",
                "py-4"
            )}
        >
            <ul className="px-2 space-y-1">
                {items.map((it) => {
                    if (it.type === "page") {
                        const p = it as NavPage;
                        const href = p.hrefTemplate;
                        const active = isActiveExact(pathname, href);
                        const linkProps = p.newTab
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {};
                        return (
                            <li key={p.label}>
                                <Link
                                    href={href}
                                    {...linkProps}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                        active
                                            ? "bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-50 font-medium"
                                            : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                                    )}
                                >
                                    <span className="w-[1em] flex-none" aria-hidden="true" />
                                    <span className="truncate">{p.label}</span>
                                </Link>
                            </li>
                        );
                    }

                    const sec = it as NavSection;
                    const isOpen = open[sec.label];

                    return (
                        <li key={sec.label}>
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => setOpen((s) => ({ ...s, [sec.label]: !s[sec.label] }))}
                                className={cn(
                                    "group flex w-full items-center gap-2 rounded-md px-3 py-2 transition-colors",
                                    "text-[13px] text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40"
                                )}
                            >
                <span
                    className={cn(
                        "text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300 transition-transform",
                        isOpen && "rotate-90"
                    )}
                    aria-hidden="true"
                >
                  <ChevronRight />
                </span>
                                <span className="truncate">{sec.label}</span>
                            </button>

                            {isOpen &&
                                sec.children.map((c) => {
                                    const href = c.hrefTemplate;
                                    const active = isActiveExact(pathname, href);
                                    const linkProps = (c as NavPage).newTab
                                        ? { target: "_blank", rel: "noopener noreferrer" }
                                        : {};
                                    return (
                                        <Link
                                            key={c.label}
                                            href={href}
                                            {...linkProps}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors mt-0.5",
                                                active
                                                    ? "bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-50 font-medium"
                                                    : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                                            )}
                                        >
                                            <span className="w-[1em] flex-none" aria-hidden="true" />
                                            <span className="truncate">{c.label}</span>
                                        </Link>
                                    );
                                })}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
