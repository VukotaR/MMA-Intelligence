import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Event } from './entities/event.entity';
import { Organization } from '../organizations/entities/organization.entity';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const organization =
      await this.organizationRepository.findOne({
        where: {
          id: dto.organizationId,
        },
      });

    if (!organization) {
      throw new NotFoundException(
        `Organization with ID ${dto.organizationId} not found`,
      );
    }

    const event = this.eventRepository.create({
      name: dto.name.trim(),
      date: new Date(dto.date),
      city: dto.city.trim(),
      country: dto.country.trim(),
      venue: dto.venue?.trim() || undefined,
      poster: dto.poster?.trim() || undefined,
      description: dto.description?.trim() || undefined,
      status: dto.status,
      organization,
    });

    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: {
        organization: true,
        fights: {
          redCorner: true,
          blueCorner: true,
          winner: true,
        },
      },
      order: {
        date: 'DESC',
        fights: {
          cardOrder: 'ASC',
        },
      },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: {
        id,
      },
      relations: {
        organization: true,
        fights: {
          redCorner: true,
          blueCorner: true,
          winner: true,
        },
      },
      order: {
        fights: {
          cardOrder: 'ASC',
        },
      },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with ID ${id} not found`,
      );
    }

    return event;
  }

  async update(
    id: number,
    dto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findOne(id);

    if (dto.organizationId !== undefined) {
      const organization =
        await this.organizationRepository.findOne({
          where: {
            id: dto.organizationId,
          },
        });

      if (!organization) {
        throw new NotFoundException(
          `Organization with ID ${dto.organizationId} not found`,
        );
      }

      event.organization = organization;
    }

    if (dto.name !== undefined) {
      event.name = dto.name.trim();
    }

    if (dto.date !== undefined) {
     event.date = new Date(dto.date);
    }

    if (dto.city !== undefined) {
      event.city = dto.city.trim();
    }

    if (dto.country !== undefined) {
      event.country = dto.country.trim();
    }

    if (dto.venue !== undefined) {
      event.venue = dto.venue.trim();
    }

    if (dto.poster !== undefined) {
      event.poster = dto.poster.trim();
    }

    if (dto.description !== undefined) {
      event.description = dto.description.trim();
    }

    if (dto.status !== undefined) {
      event.status = dto.status;
    }

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<{ message: string }> {
    const event = await this.findOne(id);

    if (event.fights?.length > 0) {
      throw new BadRequestException(
        'Event cannot be deleted while it contains fights. Delete the fights first.',
      );
    }

    await this.eventRepository.remove(event);

    return {
      message: 'Event deleted successfully',
    };
  }
}