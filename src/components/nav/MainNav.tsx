"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
    { label: "Games", href: "/games" },
    { label: "About", href: "/" },
    { label: "Settings", href: "/settings" },
];

function isActive(pathname: string, href: string) {
    return pathname === href;
}

export default function MainNav() {
    const pathname = usePathname();

    return (
        <header
            className={cn(
                "sticky top-0 z-30 w-full",
                "bg-primary-light dark:bg-primary-dark text-white",
                "border-b border-black/10 dark:border-white/10",
                "backdrop-blur"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex h-12 items-center justify-between">
                    <Link href="/" className="select-none text-sm font-semibold tracking-wide">
                        XC Track Sim
                    </Link>

                    <nav className="flex items-center gap-2">
                        {LINKS.map((l) => {
                            const active = isActive(pathname, l.href);
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "px-2 py-1 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                                        active ? "bg-white/20 text-white" : "text-white/90 hover:text-white hover:bg-white/15"
                                    )}
                                >
                                    {l.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}
