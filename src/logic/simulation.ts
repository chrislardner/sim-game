import {Game} from '@/types/game';
import {deleteMeet, deleteRace, loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams, saveGame, saveMeets,
    savePlayers, saveRaces, saveTeams} from '@/data/storage';
import {handleNewYear} from './newYear';
import {createRacesForMeet, fillHeatsForRace, mapWeekToGamePhase} from '@/logic/meetGenerator';
import {Meet, Race} from '@/types/schedule';
import {Team} from '@/types/team';
import {SeasonGamePhase} from '@/constants/seasons';
import {generateRaceTime} from './generateRaceTimes';
import {Player} from '@/types/player';
import {updateTeamAndPlayerPoints} from './scoring';
import {populateRaceWithParticipants} from "@/logic/populateRaces";

export async function simulateWeek(gameId: number): Promise<boolean> {
    let game: Game;
    let teams: Team[];
    let players: Player[];
    let meets: Meet[];
    let races: Race[];

    try {
        [game, teams, players, meets, races] = await Promise.all(
            [loadGameData(gameId), loadTeams(gameId), loadPlayers(gameId), loadMeets(gameId), loadRaces(gameId)]);
    } catch (error) {
        console.error("Error loading game data", error);
        return Promise.reject(false);
    }

    const phase: SeasonGamePhase = mapWeekToGamePhase(game.currentWeek).type;
    game.gamePhase = phase;

    let success = false;

    if (phase === 'regular') {
        success = await simulateRegularSeason(game, teams, players, meets, races);
    } else if (phase === 'playoffs') {
        success = await simulatePlayoffs(game, teams, players, meets, races);
    } else if (phase === 'offseason') {
        success = await handleOffseason(game);
    }

    if (!success) {
        console.error("Simulation failed");
        return Promise.reject(false);
    }

    const [incOk, newYear] = await incrementWeek(game);
    if (!incOk) {
        console.error("Increment week failed");
        return Promise.reject(false);
    }
    if (newYear) {
        await handleNewYear(game, teams, players, meets, races);
        return Promise.resolve(true);
    }

    if (game.currentWeek == 11 || game.currentWeek == 26 || game.currentWeek == 41) {
        await saveGame(game);
        await savePlayers(gameId, players);
        await saveTeams(gameId, teams);
        return Promise.resolve(true);

    } else {
        await saveMeets(gameId, meets);
        await saveRaces(gameId, races);
        await saveGame(game);
        await savePlayers(gameId, players);
        await saveTeams(gameId, teams);
        return Promise.resolve(true);
    }
}

async function populateNextWeeksRacesWithParticipants(
    game: Game, meets: Meet[], races: Race[], teams: Team[], players: Player[]
): Promise<void> {
    const week = game.currentWeek + 1;
    const year = game.currentYear
    const weekMeets = meets.filter(meet => meet.week === week && meet.year === year);
    for (const meet of weekMeets) {
        const meetRaces = races.filter(race => meet.races.includes(race.raceId));
        for (const race of meetRaces) {
            const shedObj = mapWeekToGamePhase(week);
            const validTeamsOnMeet = teams.filter(team => meet.teams.some(mt => mt.teamId === team.teamId));
            const validPlayersOnTeams = players.filter(player => validTeamsOnMeet.some(team => team.players.includes(player.playerId)));
            const participants = await populateRaceWithParticipants(validTeamsOnMeet, validPlayersOnTeams, shedObj.season, race.eventType);
            race.heats = fillHeatsForRace(shedObj.season, race.eventType, participants);
            race.participants = participants;
        }
    }
}

async function simulateRegularSeason(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    await populateNextWeeksRacesWithParticipants(game, meets, races, teams, players);
    await simulateMeetsForWeek(game, meets, races, players);
    await updateTeamAndPlayerPoints(game, teams, players, meets, races);
    return Promise.resolve(true);
}

export async function simulatePlayoffs(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        await simulateMeetsForWeek(game, meets, races, players);
        await updateTeamAndPlayerPoints(game, teams, players, meets, races);
        const ok = await prepareForNextRound(game, teams, players, meets, races);
        return ok ? Promise.resolve(true) : Promise.reject(false);
    } catch (error) {
        console.error("Error simulating playoffs", error);
        return Promise.reject(false);
    }
}

async function prepareForNextRound(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        const meetsForWeek = meets.filter(m => m.week === game.currentWeek && m.year === game.currentYear);
        const meetIds = new Set(meetsForWeek.map(m => m.meetId));
        const racesForWeek = races.filter(r => meetIds.has(r.meetId));

        game.remainingTeams = await determineWinnersByPoints(meetsForWeek, racesForWeek, players);

        if (!game.remainingTeams?.length || game.remainingTeams[0] === -1) {
            console.error("No remaining teams found");
            return Promise.reject(false);
        }
        await enterNextWeek(game, teams, players, meets, races);
        return Promise.resolve(true);
    } catch (error) {
        console.error("Error preparing for next round", error);
        return Promise.reject(false);
    }
}

async function enterNextWeek(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        if (game.currentWeek == 10 || game.currentWeek == 25 || game.currentWeek == 40) {

            const championshipTeams = teams.filter(team => game.remainingTeams.includes(team.teamId));
            await updateChampionshipWeek(game, championshipTeams, players, meets, races);
            return Promise.resolve(true);
        }

        if (game.currentWeek == 11 || game.currentWeek == 26 || game.currentWeek == 41) {
            return Promise.resolve(true);
        }
        return Promise.resolve(true);
    } catch (error) {
        console.error("Error entering next week", error);
        return Promise.reject(false);
    }
}

export async function determineWinnersByPoints(matches: Meet[], races: Race[], players: Player[]): Promise<number[]> {
    try {
        const winnersSet = new Set<number>();

        for (const meet of matches) {
            const teamScores: Record<number, number> = {};
            const meetRaceIds = new Set(meet.races);
            const meetRaces = races.filter(r => meetRaceIds.has(r.raceId));

            if (meet.season === 'cross_country' || meet.season === 'track_field') {
                for (const r of meetRaces) {
                    const raceTeams = r.teams ?? [];
                    for (const team of raceTeams) {
                        const pts = Number.isFinite(team.points) ? team.points : 0;
                        teamScores[team.teamId] = (teamScores[team.teamId] ?? 0) + pts;
                    }
                }

                const entries = Object.entries(teamScores);
                if (entries.length > 0) {
                    const sorted = entries
                        .slice()
                        .sort(([, a], [, b]) => meet.season === 'cross_country' ? a - b : b - a);

                    const n = Math.max(Math.ceil(sorted.length * 0.25), 2);
                    for (const [teamId] of sorted.slice(0, n)) {
                        winnersSet.add(Number(teamId));
                    }
                }
            }
        }

        let winners = Array.from(winnersSet);

        if (winners.length === 0) {
            const allRunners = races.flatMap(r => r.participants ?? []);
            const withTimes = allRunners.filter(p => Number.isFinite(p.playerTime));
            withTimes.sort((a, b) => (a.playerTime as number) - (b.playerTime as number));

            const topTwoTeams = new Set<number>();
            for (const runner of withTimes) {
                const player = players.find(p => p.playerId === runner.playerId);
                if (player?.teamId != null) topTwoTeams.add(player.teamId);
                if (topTwoTeams.size >= 2) break;
            }
            winners = Array.from(topTwoTeams);
        }

        if (winners.length === 0) {
            console.error("No winners found from scores or runner times");
            return Promise.reject("Error: No winners found");

        }

        return winners;
    } catch (error) {
        console.error("Error determining winners by points", error);
        return Promise.reject(error);
    }
}

// returns array of booleans [success, new year]
async function incrementWeek(game: Game): Promise<Array<boolean>> {
    try {
        game.currentWeek += 1;
        if (game.currentWeek > 52) {
            game.currentYear += 1;
            game.currentWeek = 1;
            return [true, true]
        }
        return [true, false];
    } catch (error) {
        console.error("Error incrementing week", error);
        return [false, false];
    }
}

async function handleOffseason(game: Game): Promise<boolean> {

    game.remainingTeams = game.teams;
    return Promise.resolve(true);
}

async function simulateMeetsForWeek(game: Game, meets: Meet[], races: Race[], players: Player[]): Promise<boolean> {
    const week = game.currentWeek;
    const year = game.currentYear
    const weekMeets = meets.filter(meet => meet.week === week && meet.year === year);
    for (const meet of weekMeets) {
        const meetRaces = races.filter(race => meet.races.includes(race.raceId));
        for (const race of meetRaces) {
            for (const participant of race.participants) {
                const player: Player | undefined = players.find(p => p.playerId === participant.playerId);
                if (player === undefined) {
                    console.error("No player found");
                    return Promise.reject(false);
                }
                const raceTime = generateRaceTime(race.eventType, player);
                const participantIndex = race.participants.findIndex(p => p.playerId === participant.playerId);
                if (participantIndex !== -1) {
                    race.participants[participantIndex].playerTime = raceTime;
                } else {
                    console.error(`Participant with ID ${participant.playerId} not found in race`);
                    return Promise.reject(false);
                }
            }
        }
    }
    return Promise.resolve(true);
}

function notNull<T>(x: T | null | undefined): x is T { return x != null; }

async function updateChampionshipWeek(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    const sched = mapWeekToGamePhase(game.currentWeek);
    const nextWeek = game.currentWeek + 1;
    const foundMeet = meets.find(m => m.week === nextWeek && m.year === game.currentYear);
    if (!game.remainingTeams?.length) return Promise.reject(false);
    if (!foundMeet) return Promise.reject(false);

    const foundRaces = races.filter(r => r.meetId === foundMeet.meetId);
    await deleteMeet(game.gameId, foundMeet.meetId);
    for (const r of foundRaces) await deleteRace(game.gameId, r.raceId);

    const meetTeams = teams
        .filter(t => game.remainingTeams.includes(t.teamId))
        .map(t => ({teamId: t.teamId, points: 0, has_five_racers: false}));

    const raceTeams: Team[] = meetTeams
        .map(mt => teams.find(t => t.teamId === mt.teamId) ?? null)
        .filter(notNull);

    const newRaces = await createRacesForMeet(raceTeams, players, game.gameId, sched.season, foundMeet.meetId, game.currentYear, nextWeek);

    const validTeamsOnMeet = raceTeams;
    const validPlayersOnTeams = players.filter(p => validTeamsOnMeet.some(t => t.players.includes(p.playerId)));
    for (const r of newRaces) {
        const participants = await populateRaceWithParticipants(validTeamsOnMeet, validPlayersOnTeams, sched.season, r.eventType);
        r.heats = fillHeatsForRace(sched.season, r.eventType, participants);
        r.participants = participants;
    }

    const newMeet: Meet = {
        week: nextWeek,
        meetId: foundMeet.meetId,
        date: 'Championship Playoff Round',
        year: game.currentYear,
        teams: meetTeams,
        races: newRaces.map(r => r.raceId),
        season: sched.season,
        type: sched.type,
        gameId: game.gameId
    };

    races.push(...newRaces);
    meets.push(newMeet);
    await saveMeets(game.gameId, meets);
    await saveRaces(game.gameId, races);

    return true;
}
