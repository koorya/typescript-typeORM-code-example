import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class eventTypeToString1656496283363 implements MigrationInterface {
    name = 'eventTypeToString1656496283363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "event_type" ALTER COLUMN "type" TYPE character varying(100)');
        await queryRunner.query('ALTER TABLE "event_type" ADD CONSTRAINT "event_type_type_unique" UNIQUE ("type") ');
        await queryRunner.query(`DROP TYPE "public"."event_type_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_type_type_enum" AS ENUM('unclosed_race', 'zero_transaction', 'critical_tzp_fuel_balance', 'lack_of_connection_with_sensor', 'in_out_deviation', 'abnormal_sensor_values')`);
        await queryRunner.query('ALTER TABLE "event_type"  DROP CONSTRAINT event_type_type_unique');

        await queryRunner.query('ALTER TABLE event_type ALTER COLUMN "type" TYPE "public"."event_type_type_enum" USING "type"::"public"."event_type_type_enum"');
    }

}
