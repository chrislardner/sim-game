"use client";

export default function SectionDivider({
                                           className = "my-6 md:my-8",
                                       }: { className?: string }) {
    return (
        <div className={`container mx-auto px-4 ${className}`}>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-900/15 dark:via-white/15 to-transparent" />
        </div>
    );
}
