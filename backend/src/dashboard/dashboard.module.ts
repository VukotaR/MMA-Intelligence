import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Fighter } from '../fighters/entities/fighter.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Event } from '../events/entities/event.entity';
import { Fight } from '../fights/entities/fight.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fighter,
      Organization,
      Event,
      Fight,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}