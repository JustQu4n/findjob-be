import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixInterviewQuestionsPrimaryKey1736416650000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, convert question_id to UUID
    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ALTER COLUMN question_id TYPE uuid 
      USING question_id::uuid;
    `);

    // Convert interview_id to UUID
    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ALTER COLUMN interview_id TYPE uuid 
      USING interview_id::uuid;
    `);

    // Add PRIMARY KEY constraint
    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ADD CONSTRAINT PK_interview_questions_id 
      PRIMARY KEY (question_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove PRIMARY KEY constraint
    await queryRunner.query(`
      ALTER TABLE interview_questions 
      DROP CONSTRAINT PK_interview_questions_id;
    `);

    // Revert to VARCHAR
    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ALTER COLUMN interview_id TYPE VARCHAR 
      USING interview_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ALTER COLUMN question_id TYPE VARCHAR 
      USING question_id::text;
    `);
  }
}
