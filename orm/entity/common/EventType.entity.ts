/* eslint-disable camelcase */
import {
  BaseEntity,
  Column,
  Entity as EntityORM,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventCategory, EventTypeEnum } from '../../../server/types';

@EntityORM()
export class EventType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 150,
  })
  name: string;

  @Column({
    nullable: false,
    type: 'character varying',
    length: 100,
    unique: true,
  })
  type: EventTypeEnum;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EventCategory,
  })
  category: EventCategory;
}
