import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';


import { FightStatistic } from './entities/fight-statistic.entity';

import { Fight } from '../fights/entities/fight.entity';


import { FightStatisticsService } from './fight-statistics.service';

import { FightStatisticsController } from './fight-statistics.controller';



@Module({

imports:[
  TypeOrmModule.forFeature([
    FightStatistic,
    Fight,
  ])
],


controllers:[
  FightStatisticsController,
],


providers:[
  FightStatisticsService,
]

})
export class FightStatisticsModule {}