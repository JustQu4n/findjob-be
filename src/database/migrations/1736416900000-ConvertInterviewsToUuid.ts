import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertInterviewsToUuid1736416900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert interview_id to UUID
    await queryRunner.query(`
      ALTER TABLE interviews 
      ALTER COLUMN interview_id TYPE uuid 
      USING interview_id::uuid;
    `);

    // Convert job_post_id to UUID
    await queryRunner.query(`
      ALTER TABLE interviews 
      ALTER COLUMN job_post_id TYPE uuid 
      USING job_post_id::uuid;
    `);

    // Convert employer_id to UUID
    await queryRunner.query(`
      ALTER TABLE interviews 
      ALTER COLUMN employer_id TYPE uuid 
      USING employer_id::uuid;
    `);

    // Add PRIMARY KEY constraint if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'PK_interviews_id'
            AND table_name = 'interviews'
        ) THEN
          ALTER TABLE interviews
          ADD CONSTRAINT PK_interviews_id PRIMARY KEY (interview_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to VARCHAR
    await queryRunner.query(`
      ALTER TABLE interviews 
      ALTER COLUMN employer_id TYPE VARCHAR 
      USING employer_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ALTER COLUMN job_post_id TYPE VARCHAR 
      USING job_post_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ALTER COLUMN interview_id TYPE VARCHAR 
      USING interview_id::text;
    `);
  }
}
