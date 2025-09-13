import Link from "next/link";
import BuildStamp from "@/components/BuildStamp";

export default function Hero() {
    return (
        <section className="relative">
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-28 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 via-purple-400/20 to-pink-400/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-28 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-300/20 via-cyan-300/20 to-blue-300/20 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 pt-16 md:pt-20 pb-6 md:pb-8">
                <div className="max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                        College XC & Track.
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-neutral-600 dark:text-neutral-300">
                        Build a program. Run the season.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/games"
                            className="inline-flex items-center rounded-md px-5 py-2.5 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition"
                        >
                            Play Now
                        </Link>
                        <Link
                            href="/new-game"
                            className="inline-flex items-center rounded-md px-5 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                        >
                            New Game
                        </Link>
                    </div>

                    <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <BuildStamp />
                    </div>
                </div>
            </div>
        </section>
    );
}
