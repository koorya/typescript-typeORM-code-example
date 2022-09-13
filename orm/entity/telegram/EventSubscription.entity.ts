/* eslint-disable camelcase */
import {
  BaseEntity,
  Column,
  Entity as EntityORM,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventType } from '../common/EventType.entity';

@EntityORM('event_subscription')
export class EventSubscription extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({
    type: 'character varying',
    length: 15,
    name: 'telegram_chat_id',
    nullable: false,
  })
  telegramChatId: string;

  @ManyToOne(() => EventType, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'event_id' })
  event: EventType;

  @Column({ nullable: false, type: 'uuid', name: 'event_id' })
  eventId: string;
}
