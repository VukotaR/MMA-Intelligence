import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Analysis } from './entities/analysis.entity';
import { Fighter } from '../fighters/entities/fighter.entity';
import { User } from '../users/entities/user.entity';

import { Role } from '../common/enums/role.enum';

import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,

    @InjectRepository(Fighter)
    private readonly fightersRepository: Repository<Fighter>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    createAnalysisDto: CreateAnalysisDto,
  ): Promise<Analysis> {
    const {
      redFighterId,
      blueFighterId,
      coachId,
      ...analysisData
    } = createAnalysisDto;

    if (redFighterId === blueFighterId) {
      throw new BadRequestException(
        'A fighter cannot be compared with themselves.',
      );
    }

    const redFighter = await this.findFighter(
      redFighterId,
      'Red corner fighter',
    );

    const blueFighter = await this.findFighter(
      blueFighterId,
      'Blue corner fighter',
    );

    const coach =
      coachId !== undefined && coachId !== null
        ? await this.findCoach(coachId)
        : null;

    const analysis = this.analysisRepository.create({
      ...analysisData,
      redFighter,
      blueFighter,
      coach,
    });

    return this.analysisRepository.save(analysis);
  }

  async findAll(): Promise<Analysis[]> {
    return this.analysisRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Analysis> {
    const analysis =
      await this.analysisRepository.findOne({
        where: {
          id,
        },
      });

    if (!analysis) {
      throw new NotFoundException(
        `Analysis with ID ${id} was not found.`,
      );
    }

    return analysis;
  }

  async findByFighters(
    redFighterId: number,
    blueFighterId: number,
  ): Promise<Analysis[]> {
    return this.analysisRepository
      .createQueryBuilder('analysis')
      .leftJoinAndSelect(
        'analysis.redFighter',
        'redFighter',
      )
      .leftJoinAndSelect(
        'analysis.blueFighter',
        'blueFighter',
      )
      .leftJoinAndSelect(
        'analysis.coach',
        'coach',
      )
      .where(
        `
        (
          redFighter.id = :redFighterId
          AND blueFighter.id = :blueFighterId
        )
        OR
        (
          redFighter.id = :blueFighterId
          AND blueFighter.id = :redFighterId
        )
        `,
        {
          redFighterId,
          blueFighterId,
        },
      )
      .orderBy(
        'analysis.createdAt',
        'DESC',
      )
      .getMany();
  }

  async findByCoach(
    coachId: number,
  ): Promise<Analysis[]> {
    await this.findCoach(coachId);

    return this.analysisRepository.find({
      where: {
        coach: {
          id: coachId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(
    id: number,
    updateAnalysisDto: UpdateAnalysisDto,
  ): Promise<Analysis> {
    const analysis = await this.findOne(id);

    const {
      redFighterId,
      blueFighterId,
      coachId,
      ...analysisData
    } = updateAnalysisDto;

    let redFighter = analysis.redFighter;
    let blueFighter = analysis.blueFighter;

    if (redFighterId !== undefined) {
      redFighter = await this.findFighter(
        redFighterId,
        'Red corner fighter',
      );
    }

    if (blueFighterId !== undefined) {
      blueFighter = await this.findFighter(
        blueFighterId,
        'Blue corner fighter',
      );
    }

    if (redFighter.id === blueFighter.id) {
      throw new BadRequestException(
        'A fighter cannot be compared with themselves.',
      );
    }

    analysis.redFighter = redFighter;
    analysis.blueFighter = blueFighter;

    if (coachId !== undefined) {
      analysis.coach =
        coachId === null
          ? null
          : await this.findCoach(coachId);
    }

    Object.assign(
      analysis,
      analysisData,
    );

    return this.analysisRepository.save(analysis);
  }

  async remove(id: number): Promise<{
    message: string;
  }> {
    const analysis = await this.findOne(id);

    await this.analysisRepository.remove(analysis);

    return {
      message: `Analysis with ID ${id} was successfully deleted.`,
    };
  }

  private async findFighter(
    id: number,
    label: string,
  ): Promise<Fighter> {
    const fighter =
      await this.fightersRepository.findOne({
        where: {
          id,
        },
      });

    if (!fighter) {
      throw new NotFoundException(
        `${label} with ID ${id} was not found.`,
      );
    }

    return fighter;
  }

  private async findCoach(
    id: number,
  ): Promise<User> {
    const coach =
      await this.usersRepository.findOne({
        where: {
          id,
        },
      });

    if (!coach) {
      throw new NotFoundException(
        `Coach with ID ${id} was not found.`,
      );
    }

    if (
      coach.role !== Role.COACH &&
      coach.role !== Role.ADMIN
    ) {
      throw new BadRequestException(
        'The selected user must have the COACH or ADMIN role.',
      );
    }

    if (!coach.isActive) {
      throw new BadRequestException(
        'The selected coach account is inactive.',
      );
    }

    return coach;
  }
}