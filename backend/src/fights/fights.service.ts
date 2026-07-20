import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Fight } from './entities/fight.entity';
import { Fighter } from '../fighters/entities/fighter.entity';
import { Event } from '../events/entities/event.entity';

import { CreateFightDto } from './dto/create-fight.dto';
import { UpdateFightDto } from './dto/update-fight.dto';

import { FightStatus } from './enums/fight-status.enum';
import { AnalysisStatus } from './enums/analysis-status.enum';

@Injectable()
export class FightsService {
  constructor(
    @InjectRepository(Fight)
    private readonly fightRepository: Repository<Fight>,

    @InjectRepository(Fighter)
    private readonly fighterRepository: Repository<Fighter>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(dto: CreateFightDto): Promise<Fight> {
    if (dto.redCornerId === dto.blueCornerId) {
      throw new BadRequestException(
        'A fighter cannot compete against themselves.',
      );
    }

    const event = await this.findEvent(dto.eventId);

    const redCorner = await this.findFighter(
      dto.redCornerId,
      'Red corner fighter not found.',
    );

    const blueCorner = await this.findFighter(
      dto.blueCornerId,
      'Blue corner fighter not found.',
    );

    let winner: Fighter | null = null;

    if (dto.winnerId !== undefined) {
      winner = await this.findFighter(
        dto.winnerId,
        'Winner fighter not found.',
      );

      this.validateWinner(
        winner.id,
        redCorner.id,
        blueCorner.id,
      );
    }

    this.validateFightResult(dto);

    const fight = this.fightRepository.create({
      event,
      redCorner,
      blueCorner,
      winner,

      weightClass: dto.weightClass,

      status: dto.status ?? FightStatus.SCHEDULED,

      cardPosition: dto.cardPosition,

      method: dto.method,

      methodDetails: dto.methodDetails,

      scheduledRounds: dto.scheduledRounds ?? 3,

      finishedRound: dto.finishedRound,

      finishedTime: dto.finishedTime,

      titleFight: dto.titleFight ?? false,

      youtubeUrl: dto.youtubeUrl,

      analysisStatus:
        dto.analysisStatus ??
        AnalysisStatus.NOT_STARTED,

      analysisSummary: dto.analysisSummary,

      cardOrder: dto.cardOrder ?? 0,
    });

    return this.fightRepository.save(fight);
  }

  async findAll(): Promise<Fight[]> {
    return this.fightRepository.find({
      relations: {
        event: true,
      },
      order: {
        event: {
          date: 'DESC',
        },
        cardOrder: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Fight> {
    const fight = await this.fightRepository.findOne({
      where: {
        id,
      },
      relations: {
        event: true,
      },
    });

    if (!fight) {
      throw new NotFoundException(
        `Fight with ID ${id} was not found.`,
      );
    }

    return fight;
  }

  async findByEvent(eventId: number): Promise<Fight[]> {
    await this.findEvent(eventId);

    return this.fightRepository.find({
      where: {
        event: {
          id: eventId,
        },
      },
      relations: {
        event: true,
      },
      order: {
        cardOrder: 'ASC',
      },
    });
  }

  async findByFighter(
    fighterId: number,
  ): Promise<Fight[]> {
    await this.findFighter(
      fighterId,
      'Fighter not found.',
    );

    return this.fightRepository
      .createQueryBuilder('fight')
      .leftJoinAndSelect('fight.event', 'event')
      .leftJoinAndSelect(
        'fight.redCorner',
        'redCorner',
      )
      .leftJoinAndSelect(
        'fight.blueCorner',
        'blueCorner',
      )
      .leftJoinAndSelect('fight.winner', 'winner')
      .where('redCorner.id = :fighterId', {
        fighterId,
      })
      .orWhere('blueCorner.id = :fighterId', {
        fighterId,
      })
      .orderBy('event.date', 'DESC')
      .getMany();
  }

  async update(
    id: number,
    dto: UpdateFightDto,
  ): Promise<Fight> {
    const fight = await this.findOne(id);

    let event = fight.event;
    let redCorner = fight.redCorner;
    let blueCorner = fight.blueCorner;
    let winner = fight.winner ?? null;

    if (dto.eventId !== undefined) {
      event = await this.findEvent(dto.eventId);
    }

    if (dto.redCornerId !== undefined) {
      redCorner = await this.findFighter(
        dto.redCornerId,
        'Red corner fighter not found.',
      );
    }

    if (dto.blueCornerId !== undefined) {
      blueCorner = await this.findFighter(
        dto.blueCornerId,
        'Blue corner fighter not found.',
      );
    }

    if (redCorner.id === blueCorner.id) {
      throw new BadRequestException(
        'A fighter cannot compete against themselves.',
      );
    }

    if (dto.winnerId !== undefined) {
      winner = await this.findFighter(
        dto.winnerId,
        'Winner fighter not found.',
      );
    }

    if (winner) {
      this.validateWinner(
        winner.id,
        redCorner.id,
        blueCorner.id,
      );
    }

    const updatedStatus =
      dto.status ?? fight.status;

    const updatedWinnerId =
      winner?.id ?? undefined;

    this.validateFightResult({
      ...dto,
      status: updatedStatus,
      winnerId: updatedWinnerId,
      method: dto.method ?? fight.method ?? undefined,
      finishedRound:
        dto.finishedRound ??
        fight.finishedRound ??
        undefined,
      finishedTime:
        dto.finishedTime ??
        fight.finishedTime ??
        undefined,
    });

    fight.event = event;
    fight.redCorner = redCorner;
    fight.blueCorner = blueCorner;
    fight.winner = winner;

    if (dto.weightClass !== undefined) {
      fight.weightClass = dto.weightClass;
    }

    if (dto.status !== undefined) {
      fight.status = dto.status;
    }

    if (dto.cardPosition !== undefined) {
      fight.cardPosition = dto.cardPosition;
    }

    if (dto.method !== undefined) {
      fight.method = dto.method;
    }

    if (dto.methodDetails !== undefined) {
      fight.methodDetails = dto.methodDetails;
    }

    if (dto.scheduledRounds !== undefined) {
      fight.scheduledRounds =
        dto.scheduledRounds;
    }

    if (dto.finishedRound !== undefined) {
      fight.finishedRound = dto.finishedRound;
    }

    if (dto.finishedTime !== undefined) {
      fight.finishedTime = dto.finishedTime;
    }

    if (dto.titleFight !== undefined) {
      fight.titleFight = dto.titleFight;
    }

    if (dto.youtubeUrl !== undefined) {
      fight.youtubeUrl = dto.youtubeUrl;
    }

    if (dto.analysisStatus !== undefined) {
      fight.analysisStatus =
        dto.analysisStatus;
    }

    if (dto.analysisSummary !== undefined) {
      fight.analysisSummary =
        dto.analysisSummary;
    }

    if (dto.cardOrder !== undefined) {
      fight.cardOrder = dto.cardOrder;
    }

    return this.fightRepository.save(fight);
  }

  async remove(id: number): Promise<void> {
    const fight = await this.findOne(id);

    await this.fightRepository.remove(fight);
  }

  private async findEvent(
    id: number,
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: {
        id,
      },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with ID ${id} was not found.`,
      );
    }

    return event;
  }

  private async findFighter(
    id: number,
    message: string,
  ): Promise<Fighter> {
    const fighter =
      await this.fighterRepository.findOne({
        where: {
          id,
        },
      });

    if (!fighter) {
      throw new NotFoundException(message);
    }

    return fighter;
  }

  private validateWinner(
    winnerId: number,
    redCornerId: number,
    blueCornerId: number,
  ): void {
    const winnerParticipated =
      winnerId === redCornerId ||
      winnerId === blueCornerId;

    if (!winnerParticipated) {
      throw new BadRequestException(
        'The winner must be either the red-corner or blue-corner fighter.',
      );
    }
  }

  private validateFightResult(
    dto: Partial<CreateFightDto>,
  ): void {
    if (dto.status !== FightStatus.COMPLETED) {
      return;
    }

    if (dto.winnerId === undefined) {
      throw new BadRequestException(
        'A completed fight must have a winner.',
      );
    }

    if (dto.method === undefined) {
      throw new BadRequestException(
        'A completed fight must have a result method.',
      );
    }

    if (dto.finishedRound === undefined) {
      throw new BadRequestException(
        'A completed fight must have a finished round.',
      );
    }

    if (!dto.finishedTime) {
      throw new BadRequestException(
        'A completed fight must have a finished time.',
      );
    }
  }
}