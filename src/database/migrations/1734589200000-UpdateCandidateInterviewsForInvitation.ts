import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCandidateInterviewsForInvitation1734589200000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make application_id nullable to support direct invitations
        await queryRunner.query(`
            ALTER TABLE "candidate_interviews" 
            ALTER COLUMN "application_id" DROP NOT NULL
        `);

        // Add invitation_email column for tracking invitations
        await queryRunner.query(`
            ALTER TABLE "candidate_interviews" 
            ADD COLUMN "invitation_email" VARCHAR(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove invitation_email column
        await queryRunner.query(`
            ALTER TABLE "candidate_interviews" 
            DROP COLUMN "invitation_email"
        `);

        // Note: We cannot easily revert application_id to NOT NULL 
        // as there might be records with NULL values
        // This is a one-way migration in practice
    }

}
