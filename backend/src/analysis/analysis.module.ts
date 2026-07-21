import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';

import { Analysis } from './entities/analysis.entity';
import { Fighter } from '../fighters/entities/fighter.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Analysis,
      Fighter,
      User,
    ]),
  ],
  controllers: [
    AnalysisController,
  ],
  providers: [
    AnalysisService,
  ],
  exports: [
    AnalysisService,
  ],
})
export class AnalysisModule {}