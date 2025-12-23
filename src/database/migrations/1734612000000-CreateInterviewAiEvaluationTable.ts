import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInterviewAiEvaluationTable1734612000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table with all columns and primary key
    await queryRunner.query(`
      CREATE TABLE "interview_ai_evaluations" (
        "evaluation_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "candidate_interview_id" uuid NOT NULL,
        "total_score" numeric NOT NULL,
        "recommendation" varchar(20) NOT NULL,
        "criteria" jsonb NOT NULL,
        "ai_summary" text NOT NULL,
        "model_used" varchar(50) NOT NULL,
        "detailed_feedback" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_interview_ai_evaluations" PRIMARY KEY ("evaluation_id")
      )
    `);

    // Create index for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_interview_ai_evaluations_candidate_interview" 
      ON "interview_ai_evaluations"("candidate_interview_id")
    `);

    // Note: Foreign key constraint skipped due to missing primary key on candidate_interviews
    // TypeORM entity relationships will still work at application level
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interview_ai_evaluations_candidate_interview"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interview_ai_evaluations" CASCADE`);
  }
}
