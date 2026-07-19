import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Fighter } from './entities/fighter.entity';

import { CreateFighterDto } from './dto/create-fighter.dto';
import { UpdateFighterDto } from './dto/update-fighter.dto';

@Injectable()
export class FightersService {
  constructor(
    @InjectRepository(Fighter)
    private readonly fighterRepository: Repository<Fighter>,
  ) {}

  async create(dto: CreateFighterDto) {
    const fighter = this.fighterRepository.create(dto);
    return this.fighterRepository.save(fighter);
  }

  async findAll(search?: string) {
    if (!search) {
      return this.fighterRepository.find();
    }

    return this.fighterRepository
      .createQueryBuilder('fighter')
      .where('LOWER(fighter.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      })
      .orWhere('LOWER(fighter.nickname) LIKE LOWER(:search)', {
        search: `%${search}%`,
      })
      .orWhere('LOWER(fighter.country) LIKE LOWER(:search)', {
        search: `%${search}%`,
      })
      .orWhere('LOWER(fighter.fightingStyle) LIKE LOWER(:search)', {
        search: `%${search}%`,
      })
      .getMany();
  }

  async findOne(id: number) {
    const fighter = await this.fighterRepository.findOne({
      where: { id },
    });

    if (!fighter) {
      throw new NotFoundException('Fighter not found');
    }

    return fighter;
  }

  async update(id: number, dto: UpdateFighterDto) {
    await this.findOne(id);

    await this.fighterRepository.update(id, dto);

    return this.findOne(id);
  }

  async remove(id: number) {
    const fighter = await this.findOne(id);

    return this.fighterRepository.remove(fighter);
  }
}