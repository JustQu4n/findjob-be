import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCandidateInterviewsPrimaryKey1736417000000 implements MigrationInterface {
    name = 'FixCandidateInterviewsPrimaryKey1736417000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add primary key constraint to candidate_interviews if it doesn't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = 'PK_candidate_interviews_id' 
                    AND table_name = 'candidate_interviews'
                ) THEN
                    ALTER TABLE candidate_interviews 
                    ADD CONSTRAINT "PK_candidate_interviews_id" PRIMARY KEY (candidate_interview_id);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove primary key constraint
        await queryRunner.query(`
            ALTER TABLE candidate_interviews 
            DROP CONSTRAINT IF EXISTS "PK_candidate_interviews_id";
        `);
    }
}
