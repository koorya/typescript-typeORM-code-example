import { MigrationInterface, QueryRunner } from "typeorm";

export class storeMessageId1659439152890 implements MigrationInterface {
    name = 'storeMessageId1659439152890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_telegram_message" ADD "telegram_message_id" integer NOT NULL DEFAULT '-1'`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "event_telegram_message" DROP COLUMN "telegram_message_id"`);
    }

}
