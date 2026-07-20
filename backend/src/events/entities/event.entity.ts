import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { EventStatus } from '../enums/event-status.enum';

import { Fight } from '../../fights/entities/fight.entity';

@Entity('events')
export class Event extends BaseEntity {
  @Column({ unique: true })
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
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status: EventStatus;

  @ManyToOne(
    () => Organization,
    (organization) => organization.events,
    {
      eager: true,
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  organization: Organization;

@OneToMany(
  () => Fight,
  (fight) => fight.event,
)
fights: Fight[];
}