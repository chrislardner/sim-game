"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { loadTeams, loadGameData } from '@/data/storage';
import { Team } from '@/types/team';
import Table from '@/components/TeamTable'; // Adjust the import path as necessary
import { Game } from '@/types/game';

export default function TeamsPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const [teams, setTeams] = useState<Team[]>([]);

    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const teamsData = await loadTeams(Number(gameId));
                setTeams(teamsData);
                const gameData = await loadGameData(Number(gameId));
                setGame(gameData);
            }
            fetchData();
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Teams</h1>
            {game && <Table teams={teams} game={game} />}
        </div>
    );
}
