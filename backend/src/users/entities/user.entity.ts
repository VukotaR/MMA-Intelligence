import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from '../../common/enums/role.enum';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 100 })
  email: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  username: string;

  @Column()
  password: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({
    nullable: true,
  })
  profileImage?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({
    default: true,
  })
  isActive: boolean;
}