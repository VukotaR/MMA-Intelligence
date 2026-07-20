import { WeightClass } from '../../fighters/enums/weight-class.enum';
import { FightStatus } from '../../fights/enums/fight-status.enum';
import { FightMethod } from '../../fights/enums/fight-method.enum';
import { CardPosition } from '../../fights/enums/card-position.enum';
import { AnalysisStatus } from '../../fights/enums/analysis-status.enum';

export interface FightSeedData {
  eventName: string;
  redCornerName: string;
  blueCornerName: string;
  winnerName?: string;

  weightClass: WeightClass;
  status: FightStatus;
  cardPosition: CardPosition;

  method?: FightMethod;
  methodDetails?: string;

  scheduledRounds: number;
  finishedRound?: number;
  finishedTime?: string;

  titleFight: boolean;
  youtubeUrl?: string;

  analysisStatus: AnalysisStatus;
  analysisSummary?: string;

  cardOrder: number;
}

export const fightsSeedData: FightSeedData[] = [
  {
    eventName: 'UFC 309: Jones vs. Miocic',
    redCornerName: 'Jon Jones',
    blueCornerName: 'Stipe Miocic',
    winnerName: 'Jon Jones',

    weightClass: WeightClass.HEAVYWEIGHT,
    status: FightStatus.COMPLETED,
    cardPosition: CardPosition.MAIN_EVENT,

    method: FightMethod.TKO,
    methodDetails: 'Spinning back kick and punches',

    scheduledRounds: 5,
    finishedRound: 3,
    finishedTime: '4:29',

    titleFight: true,

    analysisStatus: AnalysisStatus.NOT_STARTED,
    cardOrder: 1,
  },

  {
    eventName: 'UFC 309: Jones vs. Miocic',
    redCornerName: 'Charles Oliveira',
    blueCornerName: 'Michael Chandler',
    winnerName: 'Charles Oliveira',

    weightClass: WeightClass.LIGHTWEIGHT,
    status: FightStatus.COMPLETED,
    cardPosition: CardPosition.CO_MAIN_EVENT,

    method: FightMethod.UNANIMOUS_DECISION,
    methodDetails: 'Unanimous decision',

    scheduledRounds: 5,
    finishedRound: 5,
    finishedTime: '5:00',

    titleFight: false,

    analysisStatus: AnalysisStatus.NOT_STARTED,
    cardOrder: 2,
  },

  {
    eventName: 'UFC 303: Pereira vs. Prochazka 2',
    redCornerName: 'Alex Pereira',
    blueCornerName: 'Jiri Prochazka',
    winnerName: 'Alex Pereira',

    weightClass: WeightClass.LIGHT_HEAVYWEIGHT,
    status: FightStatus.COMPLETED,
    cardPosition: CardPosition.MAIN_EVENT,

    method: FightMethod.TKO,
    methodDetails: 'Head kick and punches',

    scheduledRounds: 5,
    finishedRound: 2,
    finishedTime: '0:13',

    titleFight: true,

    analysisStatus: AnalysisStatus.NOT_STARTED,
    cardOrder: 1,
  },

  {
    eventName: 'UFC 303: Pereira vs. Prochazka 2',
    redCornerName: 'Diego Lopes',
    blueCornerName: 'Dan Ige',
    winnerName: 'Diego Lopes',

    weightClass: WeightClass.FEATHERWEIGHT,
    status: FightStatus.COMPLETED,
    cardPosition: CardPosition.CO_MAIN_EVENT,

    method: FightMethod.UNANIMOUS_DECISION,
    methodDetails: 'Unanimous decision',

    scheduledRounds: 3,
    finishedRound: 3,
    finishedTime: '5:00',

    titleFight: false,

    analysisStatus: AnalysisStatus.NOT_STARTED,
    cardOrder: 2,
  },

  {
    eventName: 'UFC 302: Makhachev vs. Poirier',
    redCornerName: 'Islam Makhachev',
    blueCornerName: 'Dustin Poirier',
    winnerName: 'Islam Makhachev',

    weightClass: WeightClass.LIGHTWEIGHT,
    status: FightStatus.COMPLETED,
    cardPosition: CardPosition.MAIN_EVENT,

    method: FightMethod.SUBMISSION,
    methodDetails: 'D’Arce choke',

    scheduledRounds: 5,
    finishedRound: 5,
    finishedTime: '2:42',

    titleFight: true,

    analysisStatus: AnalysisStatus.NOT_STARTED,
    cardOrder: 1,
  },

  {
    eventName: 'UFC 302: Makhachev vs. Poirier',
    redCornerName: 'Sean Strickland',
    blueCornerName: 'Paulo Costa',
    winnerName: 'Sean Strickland',

    weightClass: WeightClass.MIDDLEWEIGHT,
    status: FightStatus.COMPLETED,
    cardPosition: CardPosition.CO_MAIN_EVENT,

    method: FightMethod.SPLIT_DECISION,
    methodDetails: 'Split decision',

    scheduledRounds: 5,
    finishedRound: 5,
    finishedTime: '5:00',

    titleFight: false,

    analysisStatus: AnalysisStatus.NOT_STARTED,
    cardOrder: 2,
  },
];