import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fighter } from '../fighters/entities/fighter.entity';
import { User } from '../users/entities/user.entity';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { Club } from './entities/club.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Club,
      User,
      Fighter
    ])
  ],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService]
})
export class ClubsModule {}