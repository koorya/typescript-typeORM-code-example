import { MigrationInterface, QueryRunner } from 'typeorm';
import { EventType } from '@entity/common/EventType.entity';
import { EventTypeEnum } from '@alert-service/types';

export class NewEventNames1655439186431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const eventTypeRepository = queryRunner.connection.getRepository(EventType);

    await eventTypeRepository.update(
      { type: EventTypeEnum.LACK_OF_CONNECTION_WITH_SENSOR },
      { name: 'Нет связи с датчиком уровня топлива' },
    );

    await eventTypeRepository.update(
      { type: EventTypeEnum.CRITICAL_TZP_FUEL_BALANCE },
      { name: 'Критич. уровень остатка топлива в ТЗП' },
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> { }
}
