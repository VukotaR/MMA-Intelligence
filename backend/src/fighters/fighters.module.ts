import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FightersService } from './fighters.service';
import { FightersController } from './fighters.controller';

import { Fighter } from './entities/fighter.entity';


@Module({

  imports: [
    TypeOrmModule.forFeature([Fighter])
  ],

  controllers: [
    FightersController
  ],

  providers: [
    FightersService
  ],

})

export class FightersModule {}