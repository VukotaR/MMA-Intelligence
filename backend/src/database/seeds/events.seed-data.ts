import { DeepPartial } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { EventStatus } from '../../events/enums/event-status.enum';

export const organizationSeedData = {
  name: 'UFC',
  country: 'United States',
  description:
    'Ultimate Fighting Championship is a professional mixed martial arts organization.',
};

export const eventsSeedData: DeepPartial<Event>[] = [
  {
    name: 'UFC 309: Jones vs. Miocic',
    date: new Date('2024-11-16T22:00:00'),
    city: 'New York City',
    country: 'United States',
    venue: 'Madison Square Garden',
    description:
      'UFC heavyweight championship event headlined by Jon Jones and Stipe Miocic.',
    status: EventStatus.COMPLETED,
  },
  {
    name: 'UFC 303: Pereira vs. Prochazka 2',
    date: new Date('2024-06-29T22:00:00'),
    city: 'Las Vegas',
    country: 'United States',
    venue: 'T-Mobile Arena',
    description:
      'UFC light heavyweight championship event headlined by Alex Pereira and Jiri Prochazka.',
    status: EventStatus.COMPLETED,
  },
  {
    name: 'UFC 302: Makhachev vs. Poirier',
    date: new Date('2024-06-01T22:00:00'),
    city: 'Newark',
    country: 'United States',
    venue: 'Prudential Center',
    description:
      'UFC lightweight championship event headlined by Islam Makhachev and Dustin Poirier.',
    status: EventStatus.COMPLETED,
  },
];