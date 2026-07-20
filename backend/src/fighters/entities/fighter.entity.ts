import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { WeightClass } from '../enums/weight-class.enum';

@Entity('fighters')
export class Fighter extends BaseEntity {


  @Column()
  name: string;

  @Column({ nullable: true })
  nickname: string;

  @Column()
  country: string;

  @Column()
  age: number;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column({
  type: 'enum',
  enum: WeightClass,
  default: WeightClass.LIGHTWEIGHT
})
weightClass: WeightClass;

  @Column({ default: 0 })
  reach: number;

  @Column({ nullable: true })
  stance: string;

  @Column({ nullable: true })
  fightingStyle: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio: string;


  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  draws: number;

  @Column({ default: 0 })
  koWins: number;

  @Column({ default: 0 })
  submissionWins: number;

  @Column({ default: 0 })
  decisionWins: number;

  @Column({ default: 0 })
  currentWinStreak: number;



  @Column({ default: 0 })
  strikingAccuracy: number;

  @Column({ default: 0 })
  strikingDefense: number;

  @Column({
    type: 'float',
    default: 0,
  })
  significantStrikesPerMinute: number;

  @Column({
    type: 'float',
    default: 0,
  })
  significantStrikesAbsorbedPerMinute: number;


  @Column({ default: 0 })
  takedownAccuracy: number;

  @Column({ default: 0 })
  takedownDefense: number;

  @Column({
    type: 'float',
    default: 0,
  })
  takedownsPer15: number;



  @Column({
    type: 'float',
    default: 0,
  })
  submissionAverage: number;



  @Column({
    default: 0,
  })
  ranking: number;

  @Column({
    default: false,
  })
  champion: boolean;

  @Column({
    default: false,
  })
  interimChampion: boolean;

}