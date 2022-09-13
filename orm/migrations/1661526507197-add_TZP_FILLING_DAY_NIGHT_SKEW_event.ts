import { EventCategory, EventTypeEnum } from "@alert-service/types";
import { EventType } from "@orm/entity/common/EventType.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class addTZPFILLINGDAYNIGHTSKEWEvent1661526507197 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const event_types: QueryDeepPartialEntity<EventType>[] = [
            {
                name: 'Перекос дневных и ночных заправок ТЗП',
                type: EventTypeEnum.TZP_FILLING_DAY_NIGHT_SKEW,
                category: EventCategory.TRANSACTIONS_AND_STATE,
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
