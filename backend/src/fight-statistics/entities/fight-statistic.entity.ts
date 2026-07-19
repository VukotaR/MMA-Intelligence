import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';


import { BaseEntity } from '../../common/entities/base.entity';

import { Fight } from '../../fights/entities/fight.entity';



@Entity('fight_statistics')
export class FightStatistic extends BaseEntity {


  @OneToOne(
    () => Fight,
    {
      eager:true,
    },
  )
  @JoinColumn()
  fight: Fight;



  @Column({
    default:0,
  })
  redSignificantStrikes:number;



  @Column({
    default:0,
  })
  blueSignificantStrikes:number;



  @Column({
    default:0,
  })
  redTakedowns:number;



  @Column({
    default:0,
  })
  blueTakedowns:number;



  @Column({
    default:0,
  })
  redControlTime:number;



  @Column({
    default:0,
  })
  blueControlTime:number;



  @Column({
    default:0,
  })
  redSubmissionAttempts:number;



  @Column({
    default:0,
  })
  blueSubmissionAttempts:number;



  @Column({
    default:0,
  })
  redKnockdowns:number;



  @Column({
    default:0,
  })
  blueKnockdowns:number;


}