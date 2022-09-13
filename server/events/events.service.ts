import { Injectable } from '@nestjs/common';
import { createQueryBuilder } from 'typeorm';
import { EventStatus } from '@alert-service/types';
import { Event } from '@entity/event/Event.entity';

@Injectable()
export class EventsService {
  async getActiveEvents(): Promise<Event[]> {
    const active_events = await createQueryBuilder(Event, 'event')
      .select(['event'])
      .addSelect('eventtype')
      .leftJoin('event.type', 'eventtype')
      .where('event.status = :status', { status: EventStatus.ACTIVE })
      .getMany();

    return active_events;
  }

  async getEvent(id: string): Promise<Event> {
    const active_events = await createQueryBuilder(Event, 'event')
      .select(['event'])
      .addSelect(['eventtype'])
      .leftJoin('event.type', 'eventtype')
      .where('event.id::text like :id', { id: `${id}%` })
      .getOne();

    return active_events;
  }
}
