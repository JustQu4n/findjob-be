import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobSeekerPreferences1764201000000 implements MigrationInterface {
  name = 'AddJobSeekerPreferences1764201000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns if they do not already exist
    await queryRunner.query(`ALTER TABLE "job_seekers" ADD COLUMN IF NOT EXISTS "preferred_locations" jsonb`);
    await queryRunner.query(`ALTER TABLE "job_seekers" ADD COLUMN IF NOT EXISTS "preferred_job_level" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "job_seekers" ADD COLUMN IF NOT EXISTS "preferred_job_type" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "job_seekers" ADD COLUMN IF NOT EXISTS "expected_salary" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns if they exist
    await queryRunner.query(`ALTER TABLE "job_seekers" DROP COLUMN IF EXISTS "expected_salary"`);
    await queryRunner.query(`ALTER TABLE "job_seekers" DROP COLUMN IF EXISTS "preferred_job_type"`);
    await queryRunner.query(`ALTER TABLE "job_seekers" DROP COLUMN IF EXISTS "preferred_job_level"`);
    await queryRunner.query(`ALTER TABLE "job_seekers" DROP COLUMN IF EXISTS "preferred_locations"`);
  }
}
