import Link from "next/link";
import BuildStamp from "@/components/BuildStamp";

type LinkItem = { label: string; href: string; external?: boolean };

const LINKS: LinkItem[] = [
    { label: "About",   href: "/" },
    { label: "Manual",    href: "/help/manual" },
    { label: "Contact", href: "mailto:me@example.com" },
    { label: "GitHub",  href: "https://github.com/chrislardner/sim-game", external: true },
];

export default function Footer(){
    return (
        <footer className="relative">
            <div className="container mx-auto px-4">
                <div
                    aria-hidden
                    className="h-px w-full bg-gradient-to-r from-transparent via-neutral-900/15 dark:via-white/15 to-transparent"
                />
            </div>

            <div className="container mx-auto px-4">
                <div className="py-4 md:py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <nav className="text-xs text-neutral-600 dark:text-neutral-400">
                        {LINKS.map((l, i) => (
                            <span key={l.label} className="inline-flex items-center">
                {l.external ? (
                    <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-neutral-900 dark:hover:text-neutral-100 transition"
                    >
                        {l.label}
                    </a>
                ) : (
                    <Link
                        href={l.href}
                        className="hover:text-neutral-900 dark:hover:text-neutral-100 transition"
                    >
                        {l.label}
                    </Link>
                )}
                                {i < LINKS.length - 1 && (
                                    <span aria-hidden className="mx-2 text-neutral-400 dark:text-neutral-600">·</span>
                                )}
              </span>
                        ))}
                    </nav>
                    <BuildStamp />
                </div>
            </div>
        </footer>
    );
}
