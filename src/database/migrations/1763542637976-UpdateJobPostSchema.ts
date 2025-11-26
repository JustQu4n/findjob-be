import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateJobPostSchema1763542637976 implements MigrationInterface {
    name = 'UpdateJobPostSchema1763542637976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`CREATE TABLE "job_post_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_post_id" uuid NOT NULL, "skill_id" integer NOT NULL, CONSTRAINT "PK_175ba0b71577f3f7d8d0bc5236d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "employment_type"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_employment_type_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "industries" text`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "address" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "experience" character varying(50)`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_level_enum" AS ENUM('Intern', 'Junior', 'Middle', 'Senior', 'Lead', 'Manager', 'All')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "level" "public"."job_posts_level_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_gender_enum" AS ENUM('any', 'male', 'female')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "gender" "public"."job_posts_gender_enum" NOT NULL DEFAULT 'any'`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_job_type_enum" AS ENUM('full_time', 'part_time', 'contract', 'internship')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "job_type" "public"."job_posts_job_type_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "expires_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_status_enum" AS ENUM('active', 'inactive', 'closed')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "status" "public"."job_posts_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "job_post_skills" ADD CONSTRAINT "FK_e72aecea2b10a9b2072f1bbbf90" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("job_post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_post_skills" ADD CONSTRAINT "FK_6cd9d06e3e47736065708aca76f" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "job_post_skills" DROP CONSTRAINT "FK_6cd9d06e3e47736065708aca76f"`);
        await queryRunner.query(`ALTER TABLE "job_post_skills" DROP CONSTRAINT "FK_e72aecea2b10a9b2072f1bbbf90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "status" character varying(50) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "job_type"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_job_type_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "level"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_level_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "experience"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "industries"`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_employment_type_enum" AS ENUM('full-time', 'part-time', 'internship', 'contract')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "employment_type" "public"."job_posts_employment_type_enum"`);
        await queryRunner.query(`DROP TABLE "job_post_skills"`);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
