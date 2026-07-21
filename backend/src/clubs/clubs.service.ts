import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fighter } from '../fighters/entities/fighter.entity';
import { User } from '../users/entities/user.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from './entities/club.entity';

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubsRepository: Repository<Club>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Fighter)
    private readonly fightersRepository: Repository<Fighter>
  ) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    const {
      coachId,
      ...clubData
    } = createClubDto;

    const existingClub = await this.clubsRepository.findOne({
      where: {
        name: clubData.name
      }
    });

    if (existingClub) {
      throw new BadRequestException(
        'A club with this name already exists.'
      );
    }

    let coach: User | null = null;

    if (coachId !== undefined) {
      coach = await this.usersRepository.findOne({
        where: {
          id: coachId
        }
      });

      if (!coach) {
        throw new NotFoundException(
          `Coach with ID ${coachId} was not found.`
        );
      }
    }

    const club = this.clubsRepository.create({
      ...clubData,
      coach
    });

    const savedClub = await this.clubsRepository.save(club);

    return this.findOne(savedClub.id);
  }

  async findAll(search?: string): Promise<Club[]> {
    const queryBuilder = this.clubsRepository
      .createQueryBuilder('club')
      .leftJoinAndSelect('club.coach', 'coach')
      .leftJoinAndSelect('club.fighters', 'fighters')
      .orderBy('club.name', 'ASC');

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      queryBuilder.andWhere(
        `(
          LOWER(club.name) LIKE LOWER(:search)
          OR LOWER(club.country) LIKE LOWER(:search)
          OR LOWER(club.city) LIKE LOWER(:search)
        )`,
        {
          search: `%${normalizedSearch}%`
        }
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.clubsRepository.findOne({
      where: {
        id
      },
      relations: {
        coach: true,
        fighters: true
      }
    });

    if (!club) {
      throw new NotFoundException(
        `Club with ID ${id} was not found.`
      );
    }

    return club;
  }

  async findClubFighters(id: number): Promise<Fighter[]> {
    const club = await this.findOne(id);

    return club.fighters ?? [];
  }

  async update(
    id: number,
    updateClubDto: UpdateClubDto
  ): Promise<Club> {
    const club = await this.findOne(id);

    const {
      coachId,
      ...clubData
    } = updateClubDto;

    if (
      clubData.name &&
      clubData.name !== club.name
    ) {
      const existingClub =
        await this.clubsRepository.findOne({
          where: {
            name: clubData.name
          }
        });

      if (
        existingClub &&
        existingClub.id !== id
      ) {
        throw new BadRequestException(
          'A club with this name already exists.'
        );
      }
    }

    let coach = club.coach;

    if (coachId !== undefined) {
      coach = await this.usersRepository.findOne({
        where: {
          id: coachId
        }
      });

      if (!coach) {
        throw new NotFoundException(
          `Coach with ID ${coachId} was not found.`
        );
      }
    }

    Object.assign(
      club,
      clubData,
      {
        coach
      }
    );

    await this.clubsRepository.save(club);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const club = await this.findOne(id);

    await this.clubsRepository.remove(club);
  }

  async addFighter(
    clubId: number,
    fighterId: number
  ): Promise<Club> {
    const club = await this.findOne(clubId);

    const fighter = await this.fightersRepository.findOne({
      where: {
        id: fighterId
      },
      relations: {
        club: true
      }
    });

    if (!fighter) {
      throw new NotFoundException(
        `Fighter with ID ${fighterId} was not found.`
      );
    }

    if (fighter.club?.id === club.id) {
      throw new BadRequestException(
        `${fighter.name} already belongs to this club.`
      );
    }

    fighter.club = club;

    await this.fightersRepository.save(fighter);

    return this.findOne(clubId);
  }

  async removeFighter(
    clubId: number,
    fighterId: number
  ): Promise<Club> {
    await this.findOne(clubId);

    const fighter = await this.fightersRepository.findOne({
      where: {
        id: fighterId
      },
      relations: {
        club: true
      }
    });

    if (!fighter) {
      throw new NotFoundException(
        `Fighter with ID ${fighterId} was not found.`
      );
    }

    if (fighter.club?.id !== clubId) {
      throw new BadRequestException(
        `${fighter.name} does not belong to this club.`
      );
    }

    fighter.club = null;

    await this.fightersRepository.save(fighter);

    return this.findOne(clubId);
  }
}