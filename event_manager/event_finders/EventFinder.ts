import { EventData } from '@alert-service/events/dto/events.dto';

export type EventDataWithKey = {
  key: string;
} & EventData;

export interface EventFinder {
  find: () => Promise<EventDataWithKey[]>;
}
