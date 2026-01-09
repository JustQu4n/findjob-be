import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUsersToUuid1736417100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert user_id to UUID
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN user_id TYPE uuid 
      USING user_id::uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to VARCHAR
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN user_id TYPE VARCHAR 
      USING user_id::text;
    `);
  }
}
