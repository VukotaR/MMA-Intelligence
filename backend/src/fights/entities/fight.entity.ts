import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

import { Event } from '../../events/entities/event.entity';

import { Fighter } from '../../fighters/entities/fighter.entity';


@Entity('fights')
export class Fight extends BaseEntity {


  @ManyToOne(
    () => Event,
    {
      eager: true,
    },
  )
  event: Event;



  @ManyToOne(
    () => Fighter,
    {
      eager: true,
    },
  )
  redCorner: Fighter;



  @ManyToOne(
    () => Fighter,
    {
      eager: true,
    },
  )
  blueCorner: Fighter;



  @ManyToOne(
  () => Fighter,
  {
    nullable: true,
    eager: true,
  },
)
winner?: Fighter;



  @Column({
    nullable: true,
  })
  method: string;



  @Column({
    nullable: true,
  })
  round: number;



  @Column({
    nullable: true,
  })
  time: string;



  @Column({
    default: 'SCHEDULED',
  })
  status: string;



  @Column({
    nullable: true,
  })
  videoUrl: string;



  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;


}