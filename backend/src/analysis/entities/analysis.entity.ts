import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { Fighter } from '../../fighters/entities/fighter.entity';
import { User } from '../../users/entities/user.entity';

export enum AnalysisStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity('analyses')
export class Analysis extends BaseEntity {
  @Column({
    length: 150,
  })
  title: string;

  @ManyToOne(
    () => Fighter,
    {
      eager: true,
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  redFighter: Fighter;

  @ManyToOne(
    () => Fighter,
    {
      eager: true,
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  blueFighter: Fighter;

  @ManyToOne(
    () => User,
    {
      eager: true,
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  coach: User | null;

  @Column({
    type: 'text',
  })
  summary: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  redFighterStrengths: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  redFighterWeaknesses: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  blueFighterStrengths: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  blueFighterWeaknesses: string | null;

  @Column({
    type: 'text',
  })
  overallStrategy: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  strikingStrategy: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  grapplingStrategy: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  defensiveStrategy: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  roundOnePlan: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  roundTwoPlan: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  roundThreePlan: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  championshipRoundsPlan: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  keyTargets: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  risksToAvoid: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  contingencyPlan: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  coachNotes: string | null;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.DRAFT,
  })
  status: AnalysisStatus;
}