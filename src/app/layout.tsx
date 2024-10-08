'use client';

import React from 'react';
import { GameProvider } from '@/context/GameContext';
import '@/styles/globals.css'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
