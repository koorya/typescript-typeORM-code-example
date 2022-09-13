import { EventCategory, EventTypeEnum } from "@alert-service/types";
import { EventType } from "@orm/entity/common/EventType.entity";
import { In, MigrationInterface, Not, QueryRunner } from "typeorm";

export class changeCategoryTzpFilling1660033236150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_a9bd61bc133b34e5e5fb78ff31b"`);
        await queryRunner.query(`ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_a9bd61bc133b34e5e5fb78ff31b" FOREIGN KEY ("event_id") REFERENCES "event_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        const eventTypeRepository = queryRunner.connection.getRepository(EventType);
        await eventTypeRepository.update(
            { type: EventTypeEnum.TZP_FILLING_DEVIATION },
            { category: EventCategory.TRANSACTIONS_AND_STATE },
        );
        await eventTypeRepository.delete({ type: Not(In(Object.values(EventTypeEnum))) });

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_a9bd61bc133b34e5e5fb78ff31b"`);
        await queryRunner.query(`ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_a9bd61bc133b34e5e5fb78ff31b" FOREIGN KEY ("event_id") REFERENCES "event_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }


}
