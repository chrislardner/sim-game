"use client";

import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useGameContext} from "@/components/GameLayoutProvider";
import {cn} from "@/lib/cn";

type QuickLink = {
    label: string;
    href: string;
    icon?: React.ReactNode;
};

type Props = {
    gameId: string;
    teamId?: string;
};

export default function QuickNav({gameId, teamId}: Props) {
    const pathname = usePathname();
    const {game} = useGameContext();

    const effectiveTeamId = teamId || String(game?.selectedTeamId);

    const links: QuickLink[] = [
        {label: "Dashboard", href: `/games/${gameId}`},
        {label: "Roster", href: `/games/${gameId}/team/${effectiveTeamId}/roster`},
        {label: "Lineups", href: `/games/${gameId}/team/${effectiveTeamId}/lineups`},
        {label: "Schedule", href: `/games/${gameId}/schedule`},
        {label: "Standings", href: `/games/${gameId}/standings`},
        {label: "Recruiting", href: `/games/${gameId}/recruiting`},
    ];

    return (
        <nav
            className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                            isActive
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
                        )}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export function Breadcrumbs({
                                items
                            }: {
    items: { label: string; href?: string }[]
}) {
    return (
        <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {items.map((item, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-neutral-300 dark:text-neutral-600">/</span>}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
