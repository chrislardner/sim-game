import Link from 'next/link';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <div className="flex">
                    <aside className="w-64 p-4 bg-gray-200 h-screen">
                        <nav className="flex flex-col gap-4">
                            <Link href="/">Home</Link>
                            <Link href="/new-game">New Game</Link>
                            {/* Additional links can go here */}
                        </nav>
                    </aside>
                    <main className="flex-grow p-6 bg-gray-100">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
