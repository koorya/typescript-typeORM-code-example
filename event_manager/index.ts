import { EventDataWithKey, EventFinder } from './event_finders/EventFinder';
import { EventStatus, EventTypeEnum } from '@alert-service/types';
import { createQueryBuilder } from 'typeorm';

import { EventType } from '@entity/common/EventType.entity';
import { EventData } from '@alert-service/events/dto/events.dto';
import { Event } from '@entity/event/Event.entity';
import { logEventManagerInfo } from 'common/log_utils';

export class EventManager {
  private eventFinders: EventFinder[];

  constructor(eventFinders: EventFinder[]) {
    this.eventFinders = [...eventFinders];

  }

  async update() {
    const actual_events = await this.getActualEvets();
    logEventManagerInfo('Количество актуальных событий в удаленной базе ', actual_events.length);
    const active_events = await this.getActiveEvents();
    logEventManagerInfo('Количество активных событий ', active_events.length);

    const active_events_keys = active_events.map(({ key }) => key);
    const actual_events_keys = actual_events.map(({ key }) => key);

    const events_to_save = actual_events.filter(
      ({ key }) => !active_events_keys.includes(key),
    );
    await this.saveNewEvents(events_to_save);
    logEventManagerInfo('Количество событий, добавленных в базу ', events_to_save.length);
    logEventManagerInfo('Ключи событий, добавленные в базу: ', events_to_save.map(({ key }) => key));


    const events_to_inactivate = active_events.filter(
      ({ key }) => !actual_events_keys.includes(key),
    );

    for (const event of events_to_inactivate) {
      event.status = EventStatus.INACTIVE;
      await event.save();
    }
    logEventManagerInfo('Количество инактивированных событий ', events_to_inactivate.length);


    // event_to_update
    for (const event of active_events) {
      if (event.status == EventStatus.ACTIVE) {
        const new_data = actual_events.find(
          ({ key }) => key === event.key,
        ).data;
        if (JSON.stringify(event.data.data) != JSON.stringify(new_data)) {
          event.data.data = new_data;
          await event.save();
        }
      }
    }
  }

  countEventGroupByType(events: EventData[]) {
    const types: { quantity: number; type: EventTypeEnum }[] = [];
    for (const { type } of events) {
      const found_type = types.find((t) => t.type === type);
      if (found_type) {
        found_type.quantity += 1;
      } else {
        types.push({ type, quantity: 1 });
      }
    }
    return types;
  }

  private async getActualEvets(): Promise<EventDataWithKey[]> {
    const events: EventDataWithKey[] = [];
    for (const eventFinder of this.eventFinders) {
      events.push(...(await eventFinder.find()));
    }
    return events;
  }

  private async saveNewEvents(event_data_list: EventDataWithKey[]) {
    // bulk
    const event_types = await EventType.find();
    const events_partial: Partial<Event>[] = event_data_list.map(
      ({ key, ...type_and_data }) => ({
        status: EventStatus.ACTIVE,
        key,
        data: type_and_data,
        type: event_types.find(
          ({ type: event_type }) => event_type === type_and_data.type,
        ),
      }),
    );
    await createQueryBuilder()
      .insert()
      .into(Event)
      .values(events_partial)
      .execute();
  }

  private async getActiveEvents() {
    const query = createQueryBuilder(Event, 'event')
      .select('event')
      .addSelect('eventtype.type')
      .leftJoin('event.type', 'eventtype')
      .where('event.status = :status', { status: EventStatus.ACTIVE });

    // console.log(query.getQuery());

    const active_events = await query.getMany();

    return active_events;
  }
}
