import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

import { Event } from '../../events/entities/event.entity';


@Entity('organizations')
export class Organization extends BaseEntity {


  @Column()
  name:string;


  @Column()
  country:string;


  @Column({
    nullable:true,
  })
  logo:string;


  @Column({
    type:'text',
    nullable:true,
  })
  description:string;



  @OneToMany(
    () => Event,
    event => event.organization,
  )
  events: Event[];


}