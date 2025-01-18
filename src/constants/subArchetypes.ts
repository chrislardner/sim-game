import { mainArchetypes as ma} from "./mainArchetypes"

const a1 = { main: [ma.s], races: ['100m', '200m', '400m'], chance: 0.1 };
const a2 = { main: [ma.s], races: ['100m', '200m'], chance: 0.2 };
const a3 = { main: [ma.md, ma.s], races: ['400m', '800m', '1500m'], chance: 0.3 };
const a4 = { main: [ma.md, ma.s], races: ['400m', '800m'], chance: 0.4 };
const a5 = { main: [ma.md], races: ['800m', '1500m'], chance: 0.45 };
const a6 = { main: [ma.ld, ma.md], races: ['1500m', '3000m'], chance: 0.55 };
const a7 = { main: [ma.ld, ma.md], races: ['1500m', '3000m', '5000m', '10000m', '8000m'], chance: 0.597};
const a8 = { main: [ma.ld, ma.md], races: ['3000m', '5000m','8000m'], chance: 0.697 };
const a9 = { main: [ma.ld, ma.md], races: ['1500m', '3000m','8000m'], chance: 0.797 };
const a10 = { main: [ma.ld, ma.md], races: ['3000m', '5000m', '8000m', '10000m'], chance: 0.897 };
const a11 = { main: [ma.ld], races: ['5000m', '8000m', '10000m'], chance: 0.997 };
const a12 = { main: [ma.md, ma.s, ma.ld], races: ['400m', '800m', '1500m', '8000m'], chance: 0.999 };
const a13 = { main: [ma.md, ma.s, ma.ld], races: ['200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m', '8000m'], chance: 1 };

export interface subArchetype {
    main: string[],
    races: string[],
}

export const subArchetypeList = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13];

