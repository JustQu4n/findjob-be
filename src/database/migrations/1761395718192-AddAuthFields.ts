import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthFields1761395718192 implements MigrationInterface {
    name = 'AddAuthFields1761395718192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_employers_user_id"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_employers_company_id"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_job_posts_employer_id"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_job_posts_company_id"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_job_post_id"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_job_seeker_id"`);
        await queryRunner.query(`ALTER TABLE "job_seekers" DROP CONSTRAINT "FK_job_seekers_user_id"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_admins_user_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role_id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role_id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_companies_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_companies_industry"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_title"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_location"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_employment_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_applications_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verification_token" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verification_token_expires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token_expires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token" character varying(500)`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_b5db2de89197ada09695cbaf900" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_15d98d0d36739f69ebb75d767a7" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_784301bc05fc0073e852211f17c" FOREIGN KEY ("employer_id") REFERENCES "employers"("employer_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_99666f01665f814e46461e21d3b" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_24456c013c27621eb6ba693c5f1" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("job_post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_de581fac8611f95c4a26859597f" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("job_seeker_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_seekers" ADD CONSTRAINT "FK_2e6598127070580810c62369b10" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "job_seekers" DROP CONSTRAINT "FK_2e6598127070580810c62369b10"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_de581fac8611f95c4a26859597f"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_24456c013c27621eb6ba693c5f1"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_99666f01665f814e46461e21d3b"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_784301bc05fc0073e852211f17c"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_15d98d0d36739f69ebb75d767a7"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_b5db2de89197ada09695cbaf900"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verification_token_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verification_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_email_verified"`);
        await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_applications_status" ON "applications" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_employment_type" ON "job_posts" ("employment_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_location" ON "job_posts" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_title" ON "job_posts" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_companies_industry" ON "companies" ("industry") `);
        await queryRunner.query(`CREATE INDEX "IDX_companies_name" ON "companies" ("name") `);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_admins_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_seekers" ADD CONSTRAINT "FK_job_seekers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_job_seeker_id" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("job_seeker_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_job_post_id" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("job_post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_job_posts_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_job_posts_employer_id" FOREIGN KEY ("employer_id") REFERENCES "employers"("employer_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_employers_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_employers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
