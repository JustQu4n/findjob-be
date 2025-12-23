import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobSeekerAndUserCover1771000001000 implements MigrationInterface {
  name = 'AddJobSeekerAndUserCover1771000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "job_seekers" ADD COLUMN "cover_url" varchar(500)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "cover_url" varchar(500)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cover_url"`);
    await queryRunner.query(`ALTER TABLE "job_seekers" DROP COLUMN "cover_url"`);
  }
}
