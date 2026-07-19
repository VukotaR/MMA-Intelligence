import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('events')
export class Event extends BaseEntity {

  @Column()
  name: string;

  @Column({
    type: 'timestamp',
  })
  date: Date;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({
    nullable: true,
  })
  venue: string;

  @Column({
    nullable: true,
  })
  poster: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    default: 'UPCOMING',
  })
  status: string;

  @ManyToOne(
()=>Organization,
organization=>organization.events,
{
eager:true,
}
)
organization:Organization;
}