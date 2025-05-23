import {PlayerInteractions, PlayerRatings} from "@/types/player";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generatePlayerInteractions(_playerInfo: PlayerRatings, startYear: number, currentYear: number): PlayerInteractions {
    const moodWithTeam = {};
    const interactionsWithTeam = {};
    return {moodWithTeam, interactionsWithTeam};
}
