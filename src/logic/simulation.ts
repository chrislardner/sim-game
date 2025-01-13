import { Game } from '@/types/game';
import { saveGame, loadGameData, loadMeets, loadPlayers, loadRaces, loadTeams, saveTeams, saveMeets, savePlayers, saveRaces, deleteMeet, deleteRace } from '@/data/storage';
import { handleNewRecruits, handleNewYearSchedule } from './newYear';
import { createRacesForMeet, mapWeekToGamePhase } from '@/logic/meetGenerator';
import { Meet, Race } from '@/types/schedule';
import { Team } from '@/types/team';
import { SeasonGamePhase } from '@/constants/seasons';
import { generateRaceTime, } from './generateRaceTimes';
import { Player } from '@/types/player';
import { updateTeamAndPlayerPoints } from './scoring';

export async function simulateWeek(gameId: number) {
    let game: Game;
    let teams: Team[];
    let players: Player[];
    let meets: Meet[];
    let races: Race[];

    try {
        [game, teams, players, meets, races] = await Promise.all([
            loadGameData(gameId),
            loadTeams(gameId),
            loadPlayers(gameId),
            loadMeets(gameId),
            loadRaces(gameId)
        ]);
    } catch (error) {
        console.error("Error loading game data", error);
        return;
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
        return;
    }

    const incrementSuccess = await incrementWeek(game);
    if (incrementSuccess[1]) {
        success = await handleNewRecruits(teams, players, gameId);
        success = await handleNewYearSchedule(game, teams, players, meets, races);
    }

    if (!success) {
        console.error("Increment week failed");
        return;
    }

    await saveGame(game);
    await savePlayers(gameId, players);
    if (game.currentWeek === 11 || game.currentWeek === 26 || game.currentWeek === 41) {
        await saveTeams(gameId, teams);
    }
    else if (incrementSuccess[1]) {
        await saveMeets(gameId, meets);
        await saveRaces(gameId, races);
    }
    else {
        await saveMeets(gameId, meets);
        await saveRaces(gameId, races);
        await saveTeams(gameId, teams);
    }

}

async function simulateRegularSeason(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    await simulateMeetsForWeek(game, meets, races);
    await updateTeamAndPlayerPoints(game, teams, players, meets, races);
    return Promise.resolve(true);
}

export async function simulatePlayoffs(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        const p1 = await simulateMeetsForWeek(game, meets, races);
        const p2 = await updateTeamAndPlayerPoints(game, teams, players, meets, races);

        const p5 = await prepareForNextRound(game, teams, players, meets, races);
        if (p1 && p2 && p5) {
            return Promise.resolve(true);
        }
        else {
            console.error(p1, p2, p5, "p1 p2 p5");
            return Promise.reject(false);
        }
    } catch (error) {
        console.error("Error simulating playoffs", error);
        return Promise.reject(false);
    }
}

async function prepareForNextRound(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        const meetsForWeek = meets.filter(meet => meet.week === game.currentWeek && meet.year === game.currentYear);
        const racesForWeek = races.filter(race => meetsForWeek.some(meet => meet.week === game.currentWeek && meet.year == game.currentYear && meet.races.includes(race.raceId)));

        try {
            const remainTeams = await determineWinnersByPoints(meetsForWeek, racesForWeek, players);
            game.remainingTeams = remainTeams;
        } catch (error) {
            console.error("Error determining winners by points", error);
            return Promise.reject(false);
        }

        if(!game.remainingTeams || game.remainingTeams.length === 0 || game.remainingTeams[0] === -1) {
            console.error("No remaining teams found");
            return Promise.reject(false);
        }

        await enterNextWeek(game, teams, players, meets, races);
        if (game.remainingTeams[0] && game.remainingTeams.length > 0) {
            return Promise.resolve(true);
        }

        console.error("error", game.remainingTeams);
        return Promise.reject(false);
    }
    catch (error) {
        console.error("Error preparing for next round", error);
        return Promise.reject(false);
    }
}

async function enterNextWeek(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    try {
        if (game.currentWeek == 10 || game.currentWeek == 25 || game.currentWeek == 40) {

            const championshipTeams = teams.filter(team => game.remainingTeams.includes(team.teamId));

            await updateChampionshipWeek(game, championshipTeams, players, meets, races);
            meets = await loadMeets(game.gameId);
            return Promise.resolve(true);
        }

        // Check if the playoffs are over
        if (game.currentWeek == 11 || game.currentWeek == 26 || game.currentWeek == 41) {
            return Promise.resolve(true);
        }
        return Promise.resolve(true);
    }
    catch (error) {
        console.error("Error entering next week", error);
        return Promise.reject(false);
    }
}

export async function determineWinnersByPoints(matches: Meet[], races: Race[], players: Player[]): Promise<number[]> {
    let winners: number[] = [];

    try {
        for (const meet of matches) {
            const teamScores: { [teamId: number]: number } = {};

            if (meet && meet.season === 'cross_country') {
                // Cross-country scoring
                meet.races.forEach(race => {
                    races.filter(r => r.raceId === race).forEach(r => {
                        if (!r.teams) {
                            console.error("No team in race");
                            return Promise.reject([-1]);
                        }
                        r.teams.forEach(team => {
                            if (team.points > 0) {
                                teamScores[team.teamId] = (teamScores[team.teamId] || 0) + team.points;
                            }
                        });
                    }
                    );
                });

                const sortedTeams = Object.entries(teamScores).sort(([, a], [, b]) => a - b);
                const numberOfTeamsToPush = Math.max(Math.ceil(sortedTeams.length * 0.25), 2);
                const teamsToPush = sortedTeams.slice(0, numberOfTeamsToPush)
                if (meet.week === 11 || meet.week === 26 || meet.week === 41) {
                }
                const teamstoPushIds: number[] = teamsToPush.map(([teamId]) => Number(teamId));

                winners = teamstoPushIds;

            } else if (meet && meet.season === 'track_field') {
                // Track & field scoring
                meet.races.forEach(race => {
                    races.filter(r => r.raceId === race).forEach(r => {
                        r.teams.forEach(team => {
                            if (team.points > 0) {
                                teamScores[team.teamId] = (teamScores[team.teamId] || 0) + team.points;
                            }
                        });
                    }
                    );
                });

                const sortedTeams = Object.entries(teamScores).sort(([, a], [, b]) => b - a);
                const numberOfTeamsToPush = Math.max(Math.ceil(sortedTeams.length * 0.25), 2);
                const teamsToPush = sortedTeams.slice(0, numberOfTeamsToPush).map(([teamId]) => Number(teamId));

                winners = teamsToPush;
            }
        }
    } catch (error) {
        console.error("Error determining winners by points", error);
        return Promise.reject(error);
    }

    if (winners.length === 0) {
        try {
            const allRunners = races.flatMap(race => race.participants);
            const sortedRunners = allRunners.sort((a, b) => a.playerTime - b.playerTime);
            const topTwoTeams = new Set<number>();
            for (const runner of sortedRunners) {
                if (topTwoTeams.size < 2) {
                    const player = players.find(player => player.playerId === runner.playerId);
                    if (player) {
                        const team = player.teamId;
                        if (team !== undefined) {
                            topTwoTeams.add(team);
                        }
                    }
                } else {
                    break;
                }
            }
            winners = Array.from(topTwoTeams);
        } catch (error) {
            console.error("Error determining top two teams by runner times", error);
            return Promise.reject(error);
        }
    }

    if(!winners || winners.length === 0) {
        console.error("No winners found");
        return Promise.reject([-1]);
    }

    return Promise.resolve(winners);
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

    game.remainingTeams = game.teams; // Reset for the next season
    return Promise.resolve(true);
}

async function simulateMeetsForWeek(game: Game, meets: Meet[], races: Race[]): Promise<boolean> {
    // Simulate all meets for the current week
    const week = game.currentWeek;
    const year = game.currentYear
    const weekMeets = meets.filter(meet => meet.week === week && meet.year === year);
    for (const meet of weekMeets) {
        const meetRaces = races.filter(race => meet.races.includes(race.raceId));
        for (const race of meetRaces) {
            for (const participant of race.participants) {
                const raceTime = generateRaceTime(participant.playerId, race.eventType);
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

async function updateChampionshipWeek(game: Game, teams: Team[], players: Player[], meets: Meet[], races: Race[]): Promise<boolean> {
    const shedObj = mapWeekToGamePhase(game.currentWeek);
    const foundMeet = meets.find(meet => meet.week === game.currentWeek + 1 && meet.year === game.currentYear);

    if(!game.remainingTeams) {
        console.error("No game remaining teams found");
        return Promise.reject(false);
    }

    if(!teams) {
        console.error("No teams found");
        return Promise.reject(false);
    }

    if (!foundMeet) {
        console.error("Could not find meet for championship week");
        return Promise.reject(false);
    }
    const foundRaces = races.filter(race => race.meetId === foundMeet.meetId);

    await deleteMeet(game.gameId, foundMeet.meetId);

    for (const race of foundRaces) {
        await deleteRace(game.gameId, race.raceId);
    }

    races = races.filter(r => r.meetId !== foundMeet.meetId);
    meets = meets.filter(m => m.meetId !== foundMeet.meetId);

    const newRaces = await createRacesForMeet(teams, players, game.gameId, shedObj.season, foundMeet.meetId, game.currentYear);


    const meetTeams = teams.filter(team => game.remainingTeams.includes(team.teamId)).map(team => ({ teamId: team.teamId, points: 0, has_five_racers: false }));

    if(!meetTeams) {
        console.error("No meet teams found");
        return Promise.reject(false);
    }

    const newMeet: Meet = {
        week: game.currentWeek + 1,
        meetId: foundMeet.meetId,
        date: 'Playoff Round',
        year: game.currentYear,
        teams: meetTeams,
        races: newRaces.map(r => r.raceId),
        season: shedObj.season,
        type: shedObj.type,
        gameId: game.gameId
    };
    races.push(...newRaces);
    meets.push(newMeet);
    await saveMeets(game.gameId, meets);
    await saveRaces(game.gameId, races);

    if (!newRaces.length) {
        console.error("No new races created");
        return Promise.reject(false);
    }
    if (!newMeet.teams.length) {
        console.error("No teams in new meet");
        return Promise.reject(false);
    }
    return Promise.resolve(true);
}
