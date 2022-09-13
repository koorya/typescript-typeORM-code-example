/* eslint-disable camelcase */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity as EntityORM,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventStatus } from '../../../server/types';
import { EventType } from '../common/EventType.entity';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  AbnormalSensorValuesData,
  CriticalTzpFuelBalanceData,
  EventData,
  LackOfConnectionData,
  MysqlConnectionFaultData,
  TZPFillingDeviationData,
  UnclosedRaceData,
  ZeroTransactionData,
} from '../../../server/events/dto/events.dto';

@ApiExtraModels(
  ZeroTransactionData,
  UnclosedRaceData,
  CriticalTzpFuelBalanceData,
  AbnormalSensorValuesData,
  LackOfConnectionData,
  MysqlConnectionFaultData,
  TZPFillingDeviationData,
)
@EntityORM()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventType, { nullable: false })
  type: EventType;

  @Column({
    type: 'character varying',
    length: 150,
  })
  key: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(ZeroTransactionData) },
      { $ref: getSchemaPath(UnclosedRaceData) },
      { $ref: getSchemaPath(CriticalTzpFuelBalanceData) },
      { $ref: getSchemaPath(AbnormalSensorValuesData) },
      { $ref: getSchemaPath(LackOfConnectionData) },
      { $ref: getSchemaPath(MysqlConnectionFaultData) },
      { $ref: getSchemaPath(TZPFillingDeviationData) },
    ],
  })
  @Column('simple-json')
  data: EventData;

  @Column({ type: 'enum', enum: EventStatus })
  status: EventStatus;

  @CreateDateColumn()
  created: Date;
}
