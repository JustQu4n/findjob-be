import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAiChatHistoryModelDefault1765439595658 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update default value for model column from 'gemini-pro' to 'gemini-1.5-flash'
        await queryRunner.query(`
            ALTER TABLE "ai_chat_history" 
            ALTER COLUMN "model" SET DEFAULT 'gemini-1.5-flash'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to old default
        await queryRunner.query(`
            ALTER TABLE "ai_chat_history" 
            ALTER COLUMN "model" SET DEFAULT 'gemini-pro'
        `);
    }

}
