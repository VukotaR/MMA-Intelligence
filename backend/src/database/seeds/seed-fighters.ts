import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../app.module';
import { Fighter } from '../../fighters/entities/fighter.entity';
import { fightersSeedData } from './fighters.seed-data';

async function seedFighters(): Promise<void> {
  const app = await NestFactory.createApplicationContext(
    AppModule,
    {
      logger: ['error', 'warn', 'log']
    }
  );

  try {
    const fighterRepository =
      app.get<Repository<Fighter>>(
        getRepositoryToken(Fighter)
      );

    console.log('Seeding fighters...');

    for (const fighterData of fightersSeedData) {
      const existingFighter =
        await fighterRepository.findOne({
          where: {
            name: fighterData.name
          }
        });

      if (existingFighter) {
        fighterRepository.merge(
          existingFighter,
          fighterData
        );

        await fighterRepository.save(existingFighter);

        console.log(
          `Updated: ${fighterData.name}`
        );
      } else {
        const fighter =
          fighterRepository.create(fighterData);

        await fighterRepository.save(fighter);

        console.log(
          `Created: ${fighterData.name}`
        );
      }
    }

    console.log(
      `Successfully seeded ${fightersSeedData.length} fighters.`
    );
  } catch (error) {
    console.error('Fighter seed failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void seedFighters();