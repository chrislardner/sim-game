import { subArchetype, subArchetypeList } from "@/constants/subArchetypes";

export function calculateSubArchetype(): subArchetype {
    const subArchetype = Math.random();
    if (subArchetype < subArchetypeList[0].chance) return subArchetypeList[0];
    else if (subArchetype < subArchetypeList[1].chance) return subArchetypeList[1];
    else if  (subArchetype < subArchetypeList[2].chance) return subArchetypeList[2];
    else if  (subArchetype < subArchetypeList[3].chance) return subArchetypeList[3];
    else if  (subArchetype < subArchetypeList[4].chance) return subArchetypeList[4];
    else if  (subArchetype < subArchetypeList[5].chance) return subArchetypeList[5];
    else if  (subArchetype < subArchetypeList[6].chance) return subArchetypeList[6];
    else if  (subArchetype < subArchetypeList[7].chance) return subArchetypeList[7];
    else if  (subArchetype < subArchetypeList[8].chance) return subArchetypeList[8];
    else if  (subArchetype < subArchetypeList[9].chance) return subArchetypeList[9];
    else if  (subArchetype < subArchetypeList[10].chance) return subArchetypeList[10];
    else return subArchetypeList[11];
}