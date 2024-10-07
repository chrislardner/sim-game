'use client';

import { GameProvider } from '../context/GameContext';
import NavBar from '../components/NavBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          <NavBar />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
