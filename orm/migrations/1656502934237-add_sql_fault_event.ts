import { EventTypeEnum, EventCategory } from "@alert-service/types";
import { EventType } from "@orm/entity/common/EventType.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class addSqlFaultEvent1656502934237 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const event_types: QueryDeepPartialEntity<EventType>[] = [
            {
                name: 'Разрыв обмена данными',
                type: EventTypeEnum.MYSQL_CONNECTION_FAULT,
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
