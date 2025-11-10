import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarToUserEntities1762719286131 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "avatar_url" VARCHAR(500);
            
            ALTER TABLE "employers"
            ADD COLUMN "avatar_url" VARCHAR(500);
            
            ALTER TABLE "job_seekers"
            ADD COLUMN "avatar_url" VARCHAR(500);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "avatar_url";
            
            ALTER TABLE "employers"
            DROP COLUMN "avatar_url";
            
            ALTER TABLE "job_seekers"
            DROP COLUMN "avatar_url";
        `);
    }

}
