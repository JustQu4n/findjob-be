import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertAuthRelatedTablesToUuid1736417200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert roles table
    await queryRunner.query(`
      ALTER TABLE roles 
      ALTER COLUMN role_id TYPE uuid 
      USING role_id::uuid;
    `);

    // Convert user_roles table
    await queryRunner.query(`
      ALTER TABLE user_roles 
      ALTER COLUMN user_id TYPE uuid 
      USING user_id::uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE user_roles 
      ALTER COLUMN role_id TYPE uuid 
      USING role_id::uuid;
    `);

    // Convert job_seekers table
    await queryRunner.query(`
      ALTER TABLE job_seekers 
      ALTER COLUMN job_seeker_id TYPE uuid 
      USING job_seeker_id::uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE job_seekers 
      ALTER COLUMN user_id TYPE uuid 
      USING user_id::uuid;
    `);

    // Convert employers table
    await queryRunner.query(`
      ALTER TABLE employers 
      ALTER COLUMN employer_id TYPE uuid 
      USING employer_id::uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE employers 
      ALTER COLUMN user_id TYPE uuid 
      USING user_id::uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE employers 
      ALTER COLUMN company_id TYPE uuid 
      USING company_id::uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert employers
    await queryRunner.query(`
      ALTER TABLE employers 
      ALTER COLUMN company_id TYPE VARCHAR 
      USING company_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE employers 
      ALTER COLUMN user_id TYPE VARCHAR 
      USING user_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE employers 
      ALTER COLUMN employer_id TYPE VARCHAR 
      USING employer_id::text;
    `);

    // Revert job_seekers
    await queryRunner.query(`
      ALTER TABLE job_seekers 
      ALTER COLUMN user_id TYPE VARCHAR 
      USING user_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE job_seekers 
      ALTER COLUMN job_seeker_id TYPE VARCHAR 
      USING job_seeker_id::text;
    `);

    // Revert user_roles
    await queryRunner.query(`
      ALTER TABLE user_roles 
      ALTER COLUMN role_id TYPE VARCHAR 
      USING role_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE user_roles 
      ALTER COLUMN user_id TYPE VARCHAR 
      USING user_id::text;
    `);

    // Revert roles
    await queryRunner.query(`
      ALTER TABLE roles 
      ALTER COLUMN role_id TYPE VARCHAR 
      USING role_id::text;
    `);
  }
}
