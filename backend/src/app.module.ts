import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfig } from './config/typeorm.config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FightersModule } from './fighters/fighters.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EventsModule } from './events/events.module';
import { FightsModule } from './fights/fights.module';
import { AnalysisModule } from './analysis/analysis.module';
import { FightStatisticsModule } from './fight-statistics/fight-statistics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ClubsModule } from './clubs/clubs.module';


@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot(typeOrmConfig),

    UsersModule,

    AuthModule,

    FightersModule,
    
    ClubsModule,

    OrganizationsModule,

    EventsModule,

    FightsModule,

    AnalysisModule,

    FightStatisticsModule,

    DashboardModule,

  ],
})
export class AppModule { }