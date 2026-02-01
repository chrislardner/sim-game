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
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-200">
                        © 2026 XC Track Sim
                    </p>
                </div>
            </div>
        </section>
    );
}
