import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInterviewsFeature1769000000000 implements MigrationInterface {
    name = 'CreateInterviewsFeature1769000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "interviews" ("interview_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_post_id" uuid, "employer_id" uuid, "title" text NOT NULL, "description" text, "status" character varying(32) NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_interviews_interview_id" PRIMARY KEY ("interview_id"))`);
        await queryRunner.query(`CREATE TABLE "interview_questions" ("question_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "interview_id" uuid NOT NULL, "question_text" text NOT NULL, "time_limit_seconds" integer, "max_score" numeric NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_interview_questions_question_id" PRIMARY KEY ("question_id"))`);
        await queryRunner.query(`CREATE TABLE "candidate_interviews" ("candidate_interview_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "interview_id" uuid NOT NULL, "application_id" uuid NOT NULL, "candidate_id" uuid NOT NULL, "assigned_by" uuid NOT NULL, "assigned_at" TIMESTAMP, "started_at" TIMESTAMP, "completed_at" TIMESTAMP, "status" character varying(32) NOT NULL DEFAULT 'assigned', "total_score" numeric, "result" character varying(32) NOT NULL DEFAULT 'pending', "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_candidate_interviews_id" PRIMARY KEY ("candidate_interview_id"))`);
        await queryRunner.query(`CREATE TABLE "interview_answers" ("interview_answer_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_interview_id" uuid NOT NULL, "question_id" uuid NOT NULL, "answer_text" text, "elapsed_seconds" integer, "score" numeric, "graded_by" uuid, "graded_at" TIMESTAMP, "feedback" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_interview_answers_id" PRIMARY KEY ("interview_answer_id"))`);

        await queryRunner.query(`ALTER TABLE "interviews" ADD CONSTRAINT "FK_interviews_job_post" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("job_post_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD CONSTRAINT "FK_interviews_employer" FOREIGN KEY ("employer_id") REFERENCES "employers"("employer_id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "interview_questions" ADD CONSTRAINT "FK_questions_interview" FOREIGN KEY ("interview_id") REFERENCES "interviews"("interview_id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "candidate_interviews" ADD CONSTRAINT "FK_candidate_interviews_interview" FOREIGN KEY ("interview_id") REFERENCES "interviews"("interview_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_interviews" ADD CONSTRAINT "FK_candidate_interviews_application" FOREIGN KEY ("application_id") REFERENCES "applications"("application_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_interviews" ADD CONSTRAINT "FK_candidate_interviews_candidate" FOREIGN KEY ("candidate_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "interview_answers" ADD CONSTRAINT "FK_answers_candidate_interview" FOREIGN KEY ("candidate_interview_id") REFERENCES "candidate_interviews"("candidate_interview_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview_answers" ADD CONSTRAINT "FK_answers_question" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("question_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "interview_answers" DROP CONSTRAINT "FK_answers_question"`);
        await queryRunner.query(`ALTER TABLE "interview_answers" DROP CONSTRAINT "FK_answers_candidate_interview"`);
        await queryRunner.query(`ALTER TABLE "candidate_interviews" DROP CONSTRAINT "FK_candidate_interviews_candidate"`);
        await queryRunner.query(`ALTER TABLE "candidate_interviews" DROP CONSTRAINT "FK_candidate_interviews_application"`);
        await queryRunner.query(`ALTER TABLE "candidate_interviews" DROP CONSTRAINT "FK_candidate_interviews_interview"`);
        await queryRunner.query(`ALTER TABLE "interview_questions" DROP CONSTRAINT "FK_questions_interview"`);
        await queryRunner.query(`ALTER TABLE "interviews" DROP CONSTRAINT "FK_interviews_employer"`);
        await queryRunner.query(`ALTER TABLE "interviews" DROP CONSTRAINT "FK_interviews_job_post"`);

        await queryRunner.query(`DROP TABLE "interview_answers"`);
        await queryRunner.query(`DROP TABLE "candidate_interviews"`);
        await queryRunner.query(`DROP TABLE "interview_questions"`);
        await queryRunner.query(`DROP TABLE "interviews"`);
    }

}
