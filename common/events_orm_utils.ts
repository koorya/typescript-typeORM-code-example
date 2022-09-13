import { createQueryBuilder } from 'typeorm';

import { Event } from "@entity/event/Event.entity";


export const getEventByPartialId = async (partial_id: string): Promise<Event> => {
	const active_events = await createQueryBuilder(Event, 'event')
		.select(['event'])
		.addSelect(['eventtype'])
		.leftJoin('event.type', 'eventtype')
		.where('event.id::text like :id', { id: `${partial_id}%` })
		.getOne();
	return active_events;
}
