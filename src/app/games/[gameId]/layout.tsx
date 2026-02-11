"use client";

import React, {use} from "react";
import GameLayoutProvider from "@/components/GameLayoutProvider";

type Props = {
    params: Promise<{ gameId: string; teamId?: string }>;
    children: React.ReactNode;
};

export default function GameLayout({params, children}: Props) {
    const {gameId} = use(params);

    return (
        <GameLayoutProvider gameId={gameId}>
            {children}
        </GameLayoutProvider>
    );
}