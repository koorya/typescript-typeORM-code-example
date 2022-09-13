import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '@entity/event/Event.entity';

@Controller()
export class EventsController {
  constructor(private readonly appService: EventsService) {}

  @Get('/active_events')
  async getActiveEvents(): Promise<Event[]> {
    return await this.appService.getActiveEvents();
  }

  @Get('/event/:id')
  async getEvent(@Param('id') id: string): Promise<Event> {
    return await this.appService.getEvent(id);
  }
}
