import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewEnhancements1734400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to interviews table
    await queryRunner.query(`
      ALTER TABLE "interviews" 
      ADD COLUMN IF NOT EXISTS "total_time_minutes" INTEGER,
      ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP;
    `);

    // Add order_index to interview_questions
    await queryRunner.query(`
      ALTER TABLE "interview_questions" 
      ADD COLUMN IF NOT EXISTS "order_index" INTEGER DEFAULT 1;
    `);

    // Add deadline_at to candidate_interviews
    await queryRunner.query(`
      ALTER TABLE "candidate_interviews" 
      ADD COLUMN IF NOT EXISTS "deadline_at" TIMESTAMP;
    `);

    // Update existing questions to have sequential order_index
    await queryRunner.query(`
      WITH ranked AS (
        SELECT question_id, 
               ROW_NUMBER() OVER (PARTITION BY interview_id ORDER BY created_at) as rn
        FROM interview_questions
      )
      UPDATE interview_questions 
      SET order_index = ranked.rn
      FROM ranked
      WHERE interview_questions.question_id = ranked.question_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN IF EXISTS "total_time_minutes"`);
    await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN IF EXISTS "deadline"`);
    await queryRunner.query(`ALTER TABLE "interview_questions" DROP COLUMN IF EXISTS "order_index"`);
    await queryRunner.query(`ALTER TABLE "candidate_interviews" DROP COLUMN IF EXISTS "deadline_at"`);
  }
}
