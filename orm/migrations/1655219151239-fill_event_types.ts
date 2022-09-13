import { EventType } from '@entity/common/EventType.entity';
import { EventTypeEnum, EventCategory } from '../../server/types';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class fillEventTypes1655219151239 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const event_types: QueryDeepPartialEntity<EventType>[] = [
      {
        name: 'Критический уровень остатка топлива в ТЗП',
        type: EventTypeEnum.CRITICAL_TZP_FUEL_BALANCE,
        category: EventCategory.TRANSACTIONS_AND_STATE,
      },
      {
        name: 'Отсутствие связи с датчиком уровня топлива',
        type: EventTypeEnum.LACK_OF_CONNECTION_WITH_SENSOR,
        category: EventCategory.TRANSACTIONS_AND_STATE,
      },
      {
        name: 'Транзакция с выдачей 0 литров',
        type: EventTypeEnum.ZERO_TRANSACTION,
        category: EventCategory.TRANSACTIONS_AND_STATE,
      },
      {
        name: 'Аномальные значения датчиков на ТЗП',
        type: EventTypeEnum.ABNORMAL_SENSOR_VALUES,
        category: EventCategory.TRANSACTIONS_AND_STATE,
      },
      {
        name: 'Незакрытый рейс',
        type: EventTypeEnum.UNCLOSED_RACE,
        category: EventCategory.LOGISTICS,
      },
    ];

    await queryRunner.connection
      .createQueryBuilder()
      .insert()
      .into(EventType)
      .values(event_types)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> { }
}
