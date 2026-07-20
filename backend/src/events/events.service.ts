import {
  Injectable,
  NotFoundException
} from '@nestjs/common';

import {
  InjectRepository
} from '@nestjs/typeorm';

import {
  Repository
} from 'typeorm';

import {
  Event
} from './entities/event.entity';

import {
  Organization
} from '../organizations/entities/organization.entity';

import {
  CreateEventDto
} from './dto/create-event.dto';

import {
  UpdateEventDto
} from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  async create(
    dto: CreateEventDto
  ): Promise<Event> {
    const organization =
      await this.organizationRepository.findOne({
        where: {
          id: dto.organizationId
        }
      });

    if (!organization) {
      throw new NotFoundException(
        'Organization not found'
      );
    }

    const event =
      this.eventRepository.create({
        name: dto.name,
        date: dto.date,
        city: dto.city,
        country: dto.country,
        venue: dto.venue,
        poster: dto.poster,
        description: dto.description,
        status: dto.status,
        organization
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
          winner: true
        }
      },
      order: {
        date: 'DESC',
        fights: {
          cardOrder: 'ASC'
        }
      }
    });
  }

  async findOne(
    id: number
  ): Promise<Event> {
    const event =
      await this.eventRepository.findOne({
        where: {
          id
        },
        relations: {
          organization: true,
          fights: {
            redCorner: true,
            blueCorner: true,
            winner: true
          }
        },
        order: {
          fights: {
            cardOrder: 'ASC'
          }
        }
      });

    if (!event) {
      throw new NotFoundException(
        'Event not found'
      );
    }

    return event;
  }

  async update(
    id: number,
    dto: UpdateEventDto
  ): Promise<Event> {
    const event =
      await this.findOne(id);

    if (dto.organizationId) {
      const organization =
        await this.organizationRepository.findOne({
          where: {
            id: dto.organizationId
          }
        });

      if (!organization) {
        throw new NotFoundException(
          'Organization not found'
        );
      }

      event.organization =
        organization;
    }

    const {
      organizationId,
      ...eventData
    } = dto;

    Object.assign(
      event,
      eventData
    );

    return this.eventRepository.save(
      event
    );
  }

  async remove(
    id: number
  ): Promise<Event> {
    const event =
      await this.findOne(id);

    return this.eventRepository.remove(
      event
    );
  }
}