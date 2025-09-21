import {Player} from "@/types/player";
import {Team} from "@/types/team";

export async function populateRaceWithParticipants(teams: Team[], players: Player[], seasonType: "cross_country" | "track_field", eventType: string) {
    const participants: {
        playerId: number;
        playerTime: number;
        scoring: { points: number; team_top_five: boolean; team_top_seven: boolean };
    }[] = [];

    const playersByTeam = new Map<number, Player[]>();
    for (const p of players) {
        if (!playersByTeam.has(p.teamId)) playersByTeam.set(p.teamId, []);
        playersByTeam.get(p.teamId)!.push(p);
    }
    for (const team of teams) {
        const teamPlayers = playersByTeam.get(team.teamId) ?? [];
        for (const player of teamPlayers) {
            const eligible = player?.eventTypes?.[seasonType]?.includes(eventType) ?? false;
            if (!eligible) continue;

            participants.push({
                playerId: player.playerId,
                playerTime: 0,
                scoring: {points: 0, team_top_five: false, team_top_seven: false},
            });
        }
    }

    return participants;
}