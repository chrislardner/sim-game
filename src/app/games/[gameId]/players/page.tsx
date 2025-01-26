"use client";

import { useEffect, useState } from 'react';
import { loadPlayers } from '@/data/storage';
import { Player } from '@/types/player';
import Table from '@/components/Table'; // Adjust the import path as necessary
import { use } from 'react';

export default function PlayersPage({ params }: { params: Promise<{ gameId: string }> }) {
    const { gameId } = use(params);
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (gameId) {
            async function fetchData() {
                const playersData = await loadPlayers(Number(gameId));
                setPlayers(playersData);
            }
            fetchData().catch(console.error);
        } else {
            console.log("couldn't find gameId", gameId);
        }
    }, [gameId]);

    const columns: { key: "fullName" | "year" | "seasons" | "overall" | "potential" | "shortDistanceOvr" | "middleDistanceOvr" | "longDistanceOvr", label: string }[] = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'year', label: 'Year' },
        { key: 'seasons', label: 'Seasons' },
        { key: 'overall', label: 'Overall' },
        { key: 'potential', label: 'Potential' },
        { key: 'shortDistanceOvr', label: 'Short Distance Ovr' },
        { key: 'middleDistanceOvr', label: 'Middle Distance Ovr' },
        { key: 'longDistanceOvr', label: 'Long Distance Ovr' },
    ];

    const data = players.map(player => ({
        ...player,
        fullName: `${player.firstName} ${player.lastName}`,
        seasons: player.seasons.map(season => season === 'track_field' ? 'Track and Field' : 'Cross Country').join(', ') as unknown as ("track_field" | "cross_country")[],
        ...player.playerRatings,
        ...player.playerRatings.typeRatings,
    }));

    const getRowLink = (player: Player) => `/games/${gameId}/players/${player.playerId}`;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-semibold mb-6 text-primary-light dark:text-primary-dark">Players</h1>
            <Table data={data} columns={columns} getRowLink={getRowLink} linkColumns={['fullName']} />
        </div>
    );
}
