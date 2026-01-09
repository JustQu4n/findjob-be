import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertInterviewAnswersToUuid1736417000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert interview_answer_id to UUID
    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN interview_answer_id TYPE uuid 
      USING interview_answer_id::uuid;
    `);

    // Convert candidate_interview_id to UUID
    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN candidate_interview_id TYPE uuid 
      USING candidate_interview_id::uuid;
    `);

    // Convert question_id to UUID
    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN question_id TYPE uuid 
      USING question_id::uuid;
    `);

    // Convert graded_by to UUID (nullable)
    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN graded_by TYPE uuid 
      USING CASE 
        WHEN graded_by IS NULL THEN NULL 
        ELSE graded_by::uuid 
      END;
    `);

    // Add PRIMARY KEY constraint if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'PK_interview_answers_id'
            AND table_name = 'interview_answers'
        ) THEN
          ALTER TABLE interview_answers
          ADD CONSTRAINT PK_interview_answers_id PRIMARY KEY (interview_answer_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to VARCHAR
    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN graded_by TYPE VARCHAR 
      USING CASE 
        WHEN graded_by IS NULL THEN NULL 
        ELSE graded_by::text 
      END;
    `);

    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN question_id TYPE VARCHAR 
      USING question_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN candidate_interview_id TYPE VARCHAR 
      USING candidate_interview_id::text;
    `);

    await queryRunner.query(`
      ALTER TABLE interview_answers 
      ALTER COLUMN interview_answer_id TYPE VARCHAR 
      USING interview_answer_id::text;
    `);
  }
}
