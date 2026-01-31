import React from "react";
import {LAST_UPDATED} from "@/constants/lastUpdated";

export const metadata = {title: "Manual • XC Track Sim"};
const fmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
});

const sections = [
    {id: "overview", label: "Overview"},
    {id: "ui", label: "Interface"},
    {id: "gameplay", label: "Gameplay Loop"},
    {id: "rules", label: "League Rules"},
    {id: "players", label: "Players & Ratings"},
    {id: "events", label: "Events & Scoring"},
    {id: "strategy", label: "Strategy"},
    {id: "faq", label: "FAQ"},
    {id: "support", label: "Support"},
];

export default function ManualPage() {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark">
            <section
                className="border-b border-neutral-200/70 dark:border-neutral-800/70 bg-gradient-to-b from-neutral-50/60 to-transparent dark:from-neutral-900/40">
                <div className="container mx-auto px-4 pt-10">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            XC Track Sim Manual
                        </h1>
                        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
                            Run a college cross country & track program. Build rosters, simulate meets, and chase
                            championships.
                        </p>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                {k: "Platform", v: "Browser • No install"},
                                {k: "Price", v: "Free"},
                            ].map((s) => (
                                <div
                                    key={s.k}
                                    className="rounded-lg border border-neutral-200/70 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/40 backdrop-blur px-4 py-3"
                                >
                                    <div
                                        className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                        {s.k}
                                    </div>
                                    <div
                                        className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{s.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-10">
                <div className="grid lg:grid-cols-[220px_1fr] gap-10">
                    <aside className="hidden lg:block">
                        <nav className="sticky top-[72px]">
                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">On this
                                page
                            </div>
                            <ul className="space-y-1">
                                {sections.map((s) => (
                                    <li key={s.id}>
                                        <a
                                            href={`#${s.id}`}
                                            className="block rounded-md px-2 py-1 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60"
                                        >
                                            {s.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    <article className="max-w-3xl space-y-7 md:space-y-14">
                        <div
                            className="rounded-lg border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 overflow-hidden">
                            <div
                                className="px-4 py-3 border-b border-neutral-200/70 dark:border-neutral-800/70 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                Quick Start
                            </div>
                            <ol className="px-4 py-4 space-y-2 text-sm text-neutral-800 dark:text-neutral-200 list-decimal list-inside">
                                <li>Go to <span className="font-medium">Games</span> → <span className="font-medium">New Game</span>.
                                </li>
                                <li>Select one or more conferences, then pick your school.</li>
                                <li>Create the league.</li>
                                <li>Use <span className="font-medium">Dashboard</span> to simulate weeks and view
                                    results.
                                </li>
                            </ol>
                        </div>

                        <Section id="overview" title="Overview">
                            <p>
                                XC Track Sim is a browser-based management sim for collegiate cross country and track.
                                Compete through a regular season of meets culminating in championships, with fictional
                                athletes and real schools.
                            </p>
                        </Section>

                        <Section id="ui" title="Interface">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Sidebar</span>: Dashboard; League → Teams, Standings,
                                    Meets, Races; Team → Roster; Players → Ratings; Stats; Tools; Help.
                                </li>
                                <li><span className="font-medium">Tables</span>: click headers to sort; links open
                                    detail pages.
                                </li>
                                <li><span className="font-medium">Theme</span>: light/dark via the top navigation.</li>
                            </ul>
                        </Section>

                        <Section id="gameplay" title="Gameplay Loop">
                            <ol className="list-decimal pl-5 space-y-2">
                                <li><span className="font-medium">Preseason</span>: ratings adjust by age/coaching
                                    (planned).
                                </li>
                                <li><span className="font-medium">Regular Season</span>: weekly meets and individual
                                    races.
                                </li>
                                <li><span className="font-medium">Championships</span>: conference → regional → national
                                    rounds.
                                </li>
                                <li><span className="font-medium">Off-season</span>: recruiting, training, redshirts,
                                    scheduling (planned).
                                </li>
                            </ol>
                        </Section>

                        <Section id="rules" title="League Rules">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Scheduling</span>: weekly cadence; bracketed
                                    championships.
                                </li>
                                <li><span className="font-medium">Customization</span>: planned “God Mode” for editing
                                    teams, players, schedules, and rules.
                                </li>
                            </ul>
                        </Section>

                        <Section id="players" title="Players & Ratings">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Fictional athletes; real schools.</li>
                                <li>Ratings 0–100 by group: Sprints, Middle, Long, Cross Country, Overall.</li>
                                <li>Potential is a scout estimate; development depends on age/coaching (planned).</li>
                            </ul>
                        </Section>

                        <Section id="events" title="Events & Scoring">
                            <p className="mb-3">Cross country uses 8k scoring; track includes common events from 100m to
                                10k.</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Card title="Cross Country">
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Scoring by finish place; lowest team total wins.</li>
                                        <li>Depth and pack time matter.</li>
                                    </ul>
                                </Card>
                                <Card title="Track">
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>Points by placement per event.</li>
                                        <li>Balance event groups for team totals.</li>
                                    </ul>
                                </Card>
                            </div>
                            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                                Formats and weights may be tuned as simulation models evolve.
                            </p>
                        </Section>

                        <Section id="strategy" title="Strategy">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Roster build</span>: cover all event groups; XC depth
                                    vs. track specialization.
                                </li>
                                <li><span className="font-medium">Season plan</span>: target key meets; rotate lineups;
                                    manage fatigue (planned).
                                </li>
                                <li><span className="font-medium">Long-term</span>: recruiting, development, facilities
                                    (planned).
                                </li>
                            </ul>
                        </Section>

                        <Section id="faq" title="FAQ">
                            <QA q="Can I edit teams/players?" a="Limited for now. A full editor is on the roadmap."/>
                            <QA q="Do I need to install anything?" a="No. It runs in your browser."/>
                        </Section>

                        <Section id="support" title="Support & Debugging">
                            <p>
                                Found a bug? Reach out to me at dev@xctracksim.com with details.
                            </p>
                        </Section>

                        <hr className="border-neutral-200/70 dark:border-neutral-800/70"/>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Last updated: {fmt.format(new Date(LAST_UPDATED))}
                        </p>
                    </article>
                </div>
            </section>
        </main>
    );
}

function Section({
                     id,
                     title,
                     children,
                 }: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {title}
            </h2>
            <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed">{children}</div>
        </section>
    );
}

function Card({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div
            className="rounded-lg border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 p-4">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</div>
            <div className="mt-2 text-neutral-800 dark:text-neutral-200">{children}</div>
        </div>
    );
}

function QA({q, a}: { q: string; a: string }) {
    return (
        <div className="space-y-1">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{q}</div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">{a}</div>
        </div>
    );
}
