/* eslint-disable camelcase */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity as EntityORM,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../event/Event.entity';

@EntityORM()
export class EventTelegramMessage extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({
    name: 'event_id',
  })
  event: Event;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'event_id',
  })
  eventId: string;

  @Column({
    type: 'character varying',
    length: 15,
    name: 'telegram_chat_id',
    nullable: false,
  })
  telegramChatId: string;

  @Column({
    type: 'integer',
    name: 'telegram_message_id',
    nullable: false,
    default: -1,
  })
  telegramMessageId: number;

  @CreateDateColumn()
  created: Date;
}
