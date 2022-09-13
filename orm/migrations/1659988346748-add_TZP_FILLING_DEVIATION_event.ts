import { EventCategory, EventTypeEnum } from "@alert-service/types";
import { EventType } from "@orm/entity/common/EventType.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class addTZPFILLINGDEVIATIONEvent1659988346748 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const event_types: QueryDeepPartialEntity<EventType>[] = [
            {
                name: 'Отклонение выданного АТЗ и заправленного в ТЗП',
                type: EventTypeEnum.TZP_FILLING_DEVIATION,
                category: EventCategory.WAREHOUSE,
            },
        ];

        await queryRunner.connection
            .createQueryBuilder()
            .insert()
            .into(EventType)
            .values(event_types)
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
