import {mainArchetypes as ma} from "./mainArchetypes"

const a1 = {
    main: [ma.s],
    events: ['100m', '200m', '400m'],
    chance: 0.20,
    num: 1,
    seasons: ['track_field']};
const a2 = {
    main: [ma.s],
    events: ['100m', '200m'],
    chance: 0.20,
    num: 2,
    seasons: ['track_field']};
const a3 = {
    main: [ma.md, ma.s],
    events: ['400m', '800m', '1500m'],
    chance: 0.1,
    num: 3,
    seasons: ['track_field']};
const a4 = {
    main: [ma.md, ma.s],
    events: ['400m', '800m'],
    chance: 0.1,
    num: 4,
    seasons: ['track_field']};
const a5 = {
    main: [ma.md],
    events: ['800m', '1500m'],
    chance: 0.075,
    num: 5,
    seasons: ['track_field']};
const a6 = {
    main: [ma.ld, ma.md],
    events: ['1500m', '3000m'],
    chance: 0.075,
    num: 6,
    seasons: ['track_field']};
const a7 = {
    main: [ma.ld, ma.md],
    events: ['1500m', '3000m', '5000m', '10000m', '8000m'],
    chance: 0.047,
    num: 7,
    seasons: ['cross_country', 'track_field']
};
const a8 = {
    main: [ma.ld, ma.md],
    events: ['3000m', '5000m', '8000m'],
    chance: 0.05,
    num: 8,
    seasons: ['cross_country', 'track_field']
};
const a9 = {
    main: [ma.ld, ma.md],
    events: ['1500m', '3000m', '8000m'],
    chance: 0.05,
    num: 9,
    seasons: ['cross_country', 'track_field']
};
const a10 = {
    main: [ma.ld, ma.md],
    events: ['3000m', '5000m', '8000m', '10000m'],
    chance: 0.05,
    num: 10,
    seasons: ['cross_country', 'track_field']
};
const a11 = {
    main: [ma.ld],
    events: ['5000m', '8000m', '10000m'],
    chance: 0.05,
    num: 11,
    seasons: ['cross_country', 'track_field']
};
const a12 = {
    main: [ma.md, ma.s, ma.ld],
    events: ['400m', '800m', '1500m', '8000m'],
    chance: 0.002,
    num: 12,
    seasons: ['cross_country', 'track_field']
};
const a13 = {
    main: [ma.md, ma.s, ma.ld],
    events: ['200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m', '8000m'],
    chance: 0.001,
    num: 13,
    seasons: ['cross_country', 'track_field']
};
// const a14 = { main: [ma.h], events: ['110mH', '400mH'], chance: 1, num: 14 };
// const a15 = { main: [ma.h, ma.s], events:['110mH', '100m', '200m'], chance: 1, num: 15 };
// const a16 = {main: [ma.h, ma.s], events: ['110mH', '400mH', '100m', '200m', '400m'], chance: 1, num: 16 };

export interface SubArchetype {
    num: number,
    main: string[],
    events: string[],
}

export const subArchetypeList = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13];
