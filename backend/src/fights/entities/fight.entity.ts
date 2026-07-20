import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { Event } from '../../events/entities/event.entity';
import { Fighter } from '../../fighters/entities/fighter.entity';
import { WeightClass } from '../../fighters/enums/weight-class.enum';

import { FightStatus } from '../enums/fight-status.enum';
import { FightMethod } from '../enums/fight-method.enum';
import { CardPosition } from '../enums/card-position.enum';
import { AnalysisStatus } from '../enums/analysis-status.enum';

@Entity('fights')
export class Fight extends BaseEntity {
  @ManyToOne(
    () => Event,
    (event) => event.fights,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'eventId',
  })
  event: Event;

  @ManyToOne(
    () => Fighter,
    {
      nullable: false,
      eager: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'redCornerId',
  })
  redCorner: Fighter;

  @ManyToOne(
    () => Fighter,
    {
      nullable: false,
      eager: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'blueCornerId',
  })
  blueCorner: Fighter;

  @ManyToOne(
    () => Fighter,
    {
      nullable: true,
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'winnerId',
  })
  winner?: Fighter | null;

  @Column({
    type: 'enum',
    enum: WeightClass,
  })
  weightClass: WeightClass;

  @Column({
    type: 'enum',
    enum: FightStatus,
    default: FightStatus.SCHEDULED,
  })
  status: FightStatus;

  @Column({
    type: 'enum',
    enum: CardPosition,
    default: CardPosition.MAIN_CARD,
  })
  cardPosition: CardPosition;

  @Column({
    type: 'enum',
    enum: FightMethod,
    nullable: true,
  })
  method?: FightMethod | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  methodDetails?: string | null;

  @Column({
    type: 'int',
    default: 3,
  })
  scheduledRounds: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  finishedRound?: number | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  finishedTime?: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  titleFight: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  youtubeUrl?: string | null;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.NOT_STARTED,
  })
  analysisStatus: AnalysisStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  analysisSummary?: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  cardOrder: number;
}