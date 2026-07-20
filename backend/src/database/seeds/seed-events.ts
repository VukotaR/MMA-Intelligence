import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../app.module';
import { Event } from '../../events/entities/event.entity';
import { Organization } from '../../organizations/entities/organization.entity';

import {
  eventsSeedData,
  organizationSeedData,
} from './events.seed-data';

async function seedEvents(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const organizationsRepository =
      app.get<Repository<Organization>>(
        getRepositoryToken(Organization),
      );

    const eventsRepository =
      app.get<Repository<Event>>(
        getRepositoryToken(Event),
      );

    let organization =
      await organizationsRepository.findOne({
        where: {
          name: organizationSeedData.name,
        },
      });

    if (!organization) {
      organization = organizationsRepository.create(
        organizationSeedData,
      );

      organization =
        await organizationsRepository.save(organization);

      console.log(`Created organization: ${organization.name}`);
    } else {
      organizationsRepository.merge(
        organization,
        organizationSeedData,
      );

      organization =
        await organizationsRepository.save(organization);

      console.log(`Updated organization: ${organization.name}`);
    }

    for (const eventData of eventsSeedData) {
      let event = await eventsRepository.findOne({
        where: {
          name: eventData.name,
        },
      });

      if (!event) {
        event = eventsRepository.create({
          ...eventData,
          organization,
        });

        await eventsRepository.save(event);

        console.log(`Created event: ${eventData.name}`);
      } else {
        eventsRepository.merge(event, {
          ...eventData,
          organization,
        });

        await eventsRepository.save(event);

        console.log(`Updated event: ${eventData.name}`);
      }
    }

    console.log(
      `Successfully seeded ${eventsSeedData.length} events.`,
    );
  } catch (error) {
    console.error('Event seed failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void seedEvents();