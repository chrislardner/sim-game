"use client";

export default function FinePrint({
                                          email = "dev@xctracksim.com",
                                      }: { email?: string }) {
    return (
        <section className="container mx-auto px-4 py-6 md:py-8">
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                        Contact
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-200">
                        Feedback or bugs:{" "}
                        <a
                            href={`mailto:${email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {email}
                        </a>
                    </p>
                </div>

                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                        Notes
                    </h2>
                    <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">
                        <li>Not affiliated with or endorsed by the NCAA or any institution.</li>
                        <li>Analytics may be cookieless and aggregated.</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
