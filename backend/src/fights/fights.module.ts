import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fight } from './entities/fight.entity';
import { Event } from '../events/entities/event.entity';
import { Fighter } from '../fighters/entities/fighter.entity';

import { FightsController } from './fights.controller';
import { FightsService } from './fights.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fight,
      Event,
      Fighter,
    ]),
  ],
  controllers: [
    FightsController,
  ],
  providers: [
    FightsService,
  ],
  exports: [
    FightsService,
  ],
})
export class FightsModule {}