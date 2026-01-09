import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCandidateBehaviorLogs1736416800000 implements MigrationInterface {
    name = 'CreateCandidateBehaviorLogs1736416800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create behavior type enum
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE candidate_behavior_type AS ENUM (
                    'PASTE',
                    'COPY',
                    'LARGE_DELETION',
                    'FAST_TYPING',
                    'TAB_SWITCH',
                    'FOCUS_LOSS'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create candidate_behavior_logs table
        await queryRunner.query(`
            CREATE TABLE candidate_behavior_logs (
                behavior_log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                candidate_interview_id UUID NOT NULL,
                question_id UUID NOT NULL,
                behavior_type candidate_behavior_type NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                description VARCHAR(500),
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_behavior_candidate_interview 
                    FOREIGN KEY (candidate_interview_id) 
                    REFERENCES candidate_interviews(candidate_interview_id) 
                    ON DELETE CASCADE,
                
                CONSTRAINT fk_behavior_question 
                    FOREIGN KEY (question_id) 
                    REFERENCES interview_questions(question_id) 
                    ON DELETE CASCADE
            );
        `);

        // Create indexes for performance
        await queryRunner.query(`
            CREATE INDEX idx_behavior_candidate_interview 
            ON candidate_behavior_logs(candidate_interview_id);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_behavior_type 
            ON candidate_behavior_logs(behavior_type);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_behavior_timestamp 
            ON candidate_behavior_logs(timestamp);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_behavior_question 
            ON candidate_behavior_logs(question_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_behavior_question;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_behavior_timestamp;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_behavior_type;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_behavior_candidate_interview;`);

        // Drop table
        await queryRunner.query(`DROP TABLE IF EXISTS candidate_behavior_logs;`);

        // Drop enum type
        await queryRunner.query(`DROP TYPE IF EXISTS candidate_behavior_type;`);
    }
}
