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

  async create(
    dto: CreateFighterDto,
  ): Promise<Fighter> {
    const fighter = this.fighterRepository.create(dto);

    return this.fighterRepository.save(fighter);
  }

  async findAll(
    search?: string,
  ): Promise<Fighter[]> {
    const normalizedSearch = search?.trim();

    const queryBuilder =
      this.fighterRepository.createQueryBuilder('fighter');

    if (normalizedSearch) {
      queryBuilder.where(
        `
          fighter.name ILIKE :search
          OR fighter.nickname ILIKE :search
          OR fighter.country ILIKE :search
          OR fighter.fightingStyle ILIKE :search
          OR fighter.stance ILIKE :search
        `,
        {
          search: `%${normalizedSearch}%`,
        },
      );
    }

    return queryBuilder
      .orderBy('fighter.champion', 'DESC')
      .addOrderBy('fighter.interimChampion', 'DESC')
      .addOrderBy('fighter.ranking', 'ASC')
      .addOrderBy('fighter.name', 'ASC')
      .getMany();
  }

  async findOne(
    id: number,
  ): Promise<Fighter> {
    const fighter =
      await this.fighterRepository.findOne({
        where: {
          id,
        },
      });

    if (!fighter) {
      throw new NotFoundException(
        `Fighter with ID ${id} was not found`,
      );
    }

    return fighter;
  }

  async update(
    id: number,
    dto: UpdateFighterDto,
  ): Promise<Fighter> {
    const fighter =
      await this.fighterRepository.preload({
        id,
        ...dto,
      });

    if (!fighter) {
      throw new NotFoundException(
        `Fighter with ID ${id} was not found`,
      );
    }

    return this.fighterRepository.save(fighter);
  }

  async remove(
    id: number,
  ): Promise<Fighter> {
    const fighter = await this.findOne(id);

    return this.fighterRepository.remove(fighter);
  }
}