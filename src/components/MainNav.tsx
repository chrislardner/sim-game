"use client";

import Link from 'next/link';

export default function MainNav() {
    return (
        <header className="bg-primary-light dark:bg-primary-dark text-white p-4 flex justify-between transition-colors">
            <nav className="space-x-4">
                <Link href="/" className="hover:underline">Home</Link>
                <Link href="/about" className="hover:underline">About</Link>
                <Link href="/settings" className="hover:underline">Settings</Link>

            </nav>
        </header>
    );
}
