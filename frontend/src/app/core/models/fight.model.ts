export interface FightEvent {
  id: number;
  name: string;
  date: string;
  location?: string | null;
  venue?: string | null;
  image?: string | null;
  status?: string;
}

export interface FightFighter {
  id: number;

  name: string;
  nickname?: string | null;
  country: string;

  age: number;
  height: number;
  weight: number;
  reach: number;

  weightClass: string;

  stance?: string | null;
  fightingStyle?: string | null;
  image?: string | null;
  bio?: string | null;

  wins: number;
  losses: number;
  draws: number;

  koWins: number;
  submissionWins: number;
  decisionWins: number;
  currentWinStreak: number;

  strikingAccuracy: number;
  strikingDefense: number;
  significantStrikesPerMinute: number;
  significantStrikesAbsorbedPerMinute: number;

  takedownAccuracy: number;
  takedownDefense: number;
  takedownsPer15: number;

  submissionAverage: number;

  ranking: number;
  champion: boolean;
  interimChampion: boolean;
}

export interface Fight {
  id: number;

  event: FightEvent;

  redCorner: FightFighter;
  blueCorner: FightFighter;
  winner?: FightFighter | null;

  weightClass: string;
  status: string;
  cardPosition: string;

  method?: string | null;
  methodDetails?: string | null;

  scheduledRounds: number;
  finishedRound?: number | null;
  finishedTime?: string | null;

  titleFight: boolean;

  youtubeUrl?: string | null;

  analysisStatus: string;
  analysisSummary?: string | null;

  cardOrder: number;

  createdAt?: string;
  updatedAt?: string;
}