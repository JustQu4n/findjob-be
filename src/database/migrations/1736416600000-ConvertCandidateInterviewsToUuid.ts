import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertCandidateInterviewsToUuid1736416600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert candidate_interview_id to UUID
    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN candidate_interview_id TYPE uuid 
      USING candidate_interview_id::uuid;
    `);

    // Convert interview_id to UUID
    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN interview_id TYPE uuid 
      USING interview_id::uuid;
    `);

    // Convert application_id to UUID
    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN application_id TYPE uuid 
      USING application_id::uuid;
    `);

    // Convert candidate_id to UUID
    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN candidate_id TYPE uuid 
      USING candidate_id::uuid;
    `);

    // Convert assigned_by to UUID
    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN assigned_by TYPE uuid 
      USING assigned_by::uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to VARCHAR
    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN assigned_by TYPE VARCHAR 
      USING assigned_by::text;
    `);

    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN candidate_id TYPE VARCHAR 
      USING candidate_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN application_id TYPE VARCHAR 
      USING application_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN interview_id TYPE VARCHAR 
      USING interview_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE candidate_interviews 
      ALTER COLUMN candidate_interview_id TYPE VARCHAR 
      USING candidate_interview_id::text;
    `);
  }
}
