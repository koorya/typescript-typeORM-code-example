import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import postgresConnectionOptions from '@orm/ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(postgresConnectionOptions)],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
