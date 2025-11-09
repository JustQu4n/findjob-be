import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResumeAndCoverLetterToApplication1762718056119 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "applications" 
            ADD COLUMN "resume_url" VARCHAR(500),
            ADD COLUMN "cover_letter" TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "applications" 
            DROP COLUMN "resume_url",
            DROP COLUMN "cover_letter"
        `);
    }

}
