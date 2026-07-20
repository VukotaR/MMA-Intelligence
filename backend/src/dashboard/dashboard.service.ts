import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fighter } from '../fighters/entities/fighter.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Event } from '../events/entities/event.entity';
import { Fight } from '../fights/entities/fight.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Fighter)
    private readonly fightersRepository: Repository<Fighter>,

    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(Fight)
    private readonly fightsRepository: Repository<Fight>,
  ) {}

  async getStats() {
    const [
      fighters,
      organizations,
      events,
      fights,
    ] = await Promise.all([
      this.fightersRepository.count(),
      this.organizationsRepository.count(),
      this.eventsRepository.count(),
      this.fightsRepository.count(),
    ]);

    return {
      fighters,
      organizations,
      events,
      fights,
    };
  }
}