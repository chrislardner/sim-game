import { mainArchetypes as ma} from "./mainArchetypes"

const a1 = { main: [ma.s], events: ['100m', '200m', '400m'], chance: 0.1, num: 1 };
const a2 = { main: [ma.s], events: ['100m', '200m'], chance: 0.2, num: 2};
const a3 = { main: [ma.md, ma.s], events: ['400m', '800m', '1500m'], chance: 0.3, num: 3 };
const a4 = { main: [ma.md, ma.s], events: ['400m', '800m'], chance: 0.4, num: 4 };
const a5 = { main: [ma.md], events: ['800m', '1500m'], chance: 0.45, num: 5 };
const a6 = { main: [ma.ld, ma.md], events: ['1500m', '3000m'], chance: 0.55, num: 6 };
const a7 = { main: [ma.ld, ma.md], events: ['1500m', '3000m', '5000m', '10000m', '8000m'], chance: 0.597, num: 7 };
const a8 = { main: [ma.ld, ma.md], events: ['3000m', '5000m','8000m'], chance: 0.697, num: 8 };
const a9 = { main: [ma.ld, ma.md], events: ['1500m', '3000m','8000m'], chance: 0.797, num: 9 };
const a10 = { main: [ma.ld, ma.md], events: ['3000m', '5000m', '8000m', '10000m'], chance: 0.897, num: 10 };
const a11 = { main: [ma.ld], events: ['5000m', '8000m', '10000m'], chance: 0.997, num: 11 };
const a12 = { main: [ma.md, ma.s, ma.ld], events: ['400m', '800m', '1500m', '8000m'], chance: 0.999, num: 12 };
const a13 = { main: [ma.md, ma.s, ma.ld], events: ['200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m', '8000m'], chance: 1 , num: 13 };
// const a14 = { main: [ma.h], racse: ['110mH', '400mH'], chance: 1, num: 14 };
// const a15 = { main: [ma.h, ma.s], events:['110mH', '100m', '200m'], chance: 1, num: 15 };
// const a16 = {main: [ma.h, ma.s], events: ['110mH', '400mH', '100m', '200m', '400m'], chance: 1, num: 16 };

export interface subArchetype {
    num: number,
    main: string[],
    events: string[],
}

export const subArchetypeList = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13];

