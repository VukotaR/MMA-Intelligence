import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../app.module';

import { Fight } from '../../fights/entities/fight.entity';
import { Fighter } from '../../fighters/entities/fighter.entity';
import { Event } from '../../events/entities/event.entity';

import { fightsSeedData } from './fights.seed-data';

async function seedFights(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const fightRepository = app.get<Repository<Fight>>(
      getRepositoryToken(Fight),
    );

    const fighterRepository = app.get<Repository<Fighter>>(
      getRepositoryToken(Fighter),
    );

    const eventRepository = app.get<Repository<Event>>(
      getRepositoryToken(Event),
    );

    for (const fightData of fightsSeedData) {
      const event = await eventRepository.findOne({
        where: {
          name: fightData.eventName,
        },
      });

      if (!event) {
        throw new Error(
          `Event "${fightData.eventName}" was not found.`,
        );
      }

      const redCorner = await fighterRepository.findOne({
        where: {
          name: fightData.redCornerName,
        },
      });

      if (!redCorner) {
        throw new Error(
          `Fighter "${fightData.redCornerName}" was not found.`,
        );
      }

      const blueCorner = await fighterRepository.findOne({
        where: {
          name: fightData.blueCornerName,
        },
      });

      if (!blueCorner) {
        throw new Error(
          `Fighter "${fightData.blueCornerName}" was not found.`,
        );
      }

      let winner: Fighter | null = null;

      if (fightData.winnerName) {
        winner = await fighterRepository.findOne({
          where: {
            name: fightData.winnerName,
          },
        });

        if (!winner) {
          throw new Error(
            `Winner "${fightData.winnerName}" was not found.`,
          );
        }
      }

      const existingFight = await fightRepository.findOne({
        where: {
          event: {
            id: event.id,
          },
          redCorner: {
            id: redCorner.id,
          },
          blueCorner: {
            id: blueCorner.id,
          },
        },
        relations: {
          event: true,
        },
      });

      const fightValues = {
        event,
        redCorner,
        blueCorner,
        winner,

        weightClass: fightData.weightClass,
        status: fightData.status,
        cardPosition: fightData.cardPosition,

        method: fightData.method,
        methodDetails: fightData.methodDetails,

        scheduledRounds: fightData.scheduledRounds,
        finishedRound: fightData.finishedRound,
        finishedTime: fightData.finishedTime,

        titleFight: fightData.titleFight,
        youtubeUrl: fightData.youtubeUrl,

        analysisStatus: fightData.analysisStatus,
        analysisSummary: fightData.analysisSummary,

        cardOrder: fightData.cardOrder,
      };

      if (!existingFight) {
        const fight = fightRepository.create(fightValues);

        await fightRepository.save(fight);

        console.log(
          `Created fight: ${redCorner.name} vs ${blueCorner.name}`,
        );
      } else {
        fightRepository.merge(existingFight, fightValues);

        await fightRepository.save(existingFight);

        console.log(
          `Updated fight: ${redCorner.name} vs ${blueCorner.name}`,
        );
      }
    }

    console.log(
      `Successfully seeded ${fightsSeedData.length} fights.`,
    );
  } catch (error) {
    console.error('Fight seed failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void seedFights();