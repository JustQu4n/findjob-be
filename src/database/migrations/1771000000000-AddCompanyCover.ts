import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyCover1771000000000 implements MigrationInterface {
  name = 'AddCompanyCover1771000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "cover_url" varchar(500)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "cover_url"`);
  }
}
