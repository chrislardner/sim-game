export type EventType =
  | '100m'
  | '200m'
  | '400m'
  | '800m'
  | '1600m'
  | '3200m'
  | '5k'
  | '10k'
  | '110m Hurdles'
  | '400m Hurdles';

export interface Athlete {
  schoolYear: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  id: string;
  name: string;
  teamId: number;
  stats: AthleteStats;
  events: EventType[];
}

export interface AthleteStats {
  athleteID: number;
  speed: number;
  endurance: number;
  strength: number;
  competitions: number;
  wins: number;
  raceResults: AthleteRaceResult[];
  personalRecords: { [event in EventType]?: number };
  seasonRecords: { [event in EventType]?: number };
}

export interface AthleteRaceResult {
  date: string; // date of the meet
  meetId: number;
  eventType: EventType;
  time: number;
  position: number;
  points: number;
}

export interface Team {
  isUserTeam: boolean;
  id: number;
  name: string;
  athletes: Athlete[];
  stats: TeamStats;
}

export interface TeamStats {
  competitions: number;
  wins: number;
  totalPoints: number;
  rank: number;
}

export interface EventResult {
  id: number;
  athleteId: string;
  time: number;
  position: number;
  points: number;
}

export interface Event {
  id: number;
  eventType: EventType;
  participants: Athlete[];
  results: EventResult[];
}

export interface TeamResult {
  teamId: number;
  points: number;
  position: number;
}

export interface Meet {
  id: number;
  name: string;
  date: string; // ISO date string
  teams: Team[];
  events: Event[];
  teamResults: TeamResult[];
}

export interface Schedule {
  week: number;
  meetName: string;
  participatingTeams: number[]; // Array of team IDs
  isPlayoff: boolean;
}

export interface GameState {
  gameName: string;
  userTeamId: number;
  currentDate: string; // ISO date string
  teams: Team[];
  athletes: Athlete[];
  meets: Meet[];
  schedule: Schedule[];
  currentWeek: number;
}

export interface GameSummary {
    id: string;
    name: string;
    currentWeek: number;
  }