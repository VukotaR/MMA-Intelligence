import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { Fighter } from '../../fighters/entities/fighter.entity';
import { User } from '../../users/entities/user.entity';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  name: string;

  @Column()
  country: string;

  @Column()
  city: string;

 @Column({
  type: 'varchar',
  nullable: true
})
logo: string | null;

  @Column({
  type: 'text',
  nullable: true
})
description: string | null;

  @ManyToOne(
    () => User,
    user => user.coachedClubs,
    {
      nullable: true,
      eager: true,
      onDelete: 'SET NULL'
    }
  )
  coach: User | null;

  @OneToMany(
    () => Fighter,
    fighter => fighter.club
  )
  fighters: Fighter[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}