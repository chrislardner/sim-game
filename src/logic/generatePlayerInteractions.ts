import {PlayerInteractions} from "@/types/player";

export function generatePlayerInteractions(): PlayerInteractions {
    const moodWithTeam = {};
    const interactionsWithTeam = {};
    const probabilityOfJoiningTeam = {};
    return {probabilityOfJoiningTeam, moodWithTeam, interactionsWithTeam};
}
