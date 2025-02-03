"use client";

import { useRouter } from 'next/navigation';

export default function MainNav() {
    const router = useRouter();

    return (
        <header className="bg-primary-light dark:bg-primary-dark text-white p-4 flex justify-between transition-colors">
            <nav className="space-x-4">
                <span className="hover:underline cursor-pointer" onClick={() => router.push('/saved')}>Games</span>
                <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>About</span>
                <span className="hover:underline cursor-pointer" onClick={() => router.push('/settings')}>Settings</span>
            </nav>
        </header>
    );
}
