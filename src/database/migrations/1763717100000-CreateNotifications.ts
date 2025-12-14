import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotifications1763717100000 implements MigrationInterface {
  name = 'CreateNotifications1763717100000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "notifications" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "user_id" uuid NOT NULL,
      "type" character varying(100) NOT NULL,
      "message" text NOT NULL,
      "metadata" jsonb,
      "is_read" boolean NOT NULL DEFAULT false,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
