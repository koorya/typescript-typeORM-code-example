import {MigrationInterface, QueryRunner} from "typeorm";

export class init1655219143431 implements MigrationInterface {
    name = 'init1655219143431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_type_type_enum" AS ENUM('unclosed_race', 'zero_transaction', 'critical_tzp_fuel_balance', 'lack_of_connection_with_sensor', 'in_out_deviation', 'abnormal_sensor_values')`);
        await queryRunner.query(`CREATE TYPE "public"."event_type_category_enum" AS ENUM('logistics', 'warehouse', 'transactions_and_state')`);
        await queryRunner.query(`CREATE TABLE "event_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "type" "public"."event_type_type_enum" NOT NULL, "category" "public"."event_type_category_enum" NOT NULL, CONSTRAINT "PK_d968f34984d7d85d96f782872fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_subscription" ("id" SERIAL NOT NULL, "telegram_chat_id" character varying(15) NOT NULL, "event_id" uuid NOT NULL, CONSTRAINT "PK_30cfa3a4d386691fef4c5995085" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(150) NOT NULL, "data" text NOT NULL, "status" "public"."event_status_enum" NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "typeId" uuid NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_telegram_message" ("id" SERIAL NOT NULL, "event_id" uuid NOT NULL, "telegram_chat_id" character varying(15) NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_348a9ee2fc177729e735ee05e77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."telegram_user_data_user_role_enum" AS ENUM('security', 'specialist', 'driver', 'company', 'admin', 'operator', 'driveratz', 'client')`);
        await queryRunner.query(`CREATE TABLE "telegram_user_data" ("id" SERIAL NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "rosnova_user_id" character varying(30) NOT NULL, "telegram_chat_id" character varying(15) NOT NULL, "user_role" "public"."telegram_user_data_user_role_enum", CONSTRAINT "UQ_014a725ff932a6429ffde83c0dc" UNIQUE ("rosnova_user_id"), CONSTRAINT "UQ_b5bd204a19553c96928ede8454f" UNIQUE ("telegram_chat_id"), CONSTRAINT "PK_d30974c0142f5977c3ee227f78b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_a9bd61bc133b34e5e5fb78ff31b" FOREIGN KEY ("event_id") REFERENCES "event_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_255cc0faa667931c91431716165" FOREIGN KEY ("typeId") REFERENCES "event_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_telegram_message" ADD CONSTRAINT "FK_81bf4adcff3bf9072cb379403c8" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_telegram_message" DROP CONSTRAINT "FK_81bf4adcff3bf9072cb379403c8"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_255cc0faa667931c91431716165"`);
        await queryRunner.query(`ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_a9bd61bc133b34e5e5fb78ff31b"`);
        await queryRunner.query(`DROP TABLE "telegram_user_data"`);
        await queryRunner.query(`DROP TYPE "public"."telegram_user_data_user_role_enum"`);
        await queryRunner.query(`DROP TABLE "event_telegram_message"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TYPE "public"."event_status_enum"`);
        await queryRunner.query(`DROP TABLE "event_subscription"`);
        await queryRunner.query(`DROP TABLE "event_type"`);
        await queryRunner.query(`DROP TYPE "public"."event_type_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_type_type_enum"`);
    }

}
