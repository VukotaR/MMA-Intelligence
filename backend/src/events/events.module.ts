import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from './entities/event.entity';
import { Organization } from '../organizations/entities/organization.entity';

import { EventsController } from './events.controller';
import { EventsService } from './events.service';


@Module({

  imports:[
    TypeOrmModule.forFeature([
      Event,
      Organization
    ])
  ],

  controllers:[
    EventsController
  ],

  providers:[
    EventsService
  ]

})
export class EventsModule {}