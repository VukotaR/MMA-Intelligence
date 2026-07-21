import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../common/enums/role.enum';
import { User } from './entities/user.entity';

export interface CoachResponse {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findCoaches(): Promise<CoachResponse[]> {
    return this.usersRepository.find({
      where: {
        role: Role.COACH,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);

    return this.usersRepository.save(newUser);
  }
}