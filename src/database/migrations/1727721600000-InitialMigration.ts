import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1727721600000 implements MigrationInterface {
    name = 'InitialMigration1727721600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM types first
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'banned')`);
        await queryRunner.query(`CREATE TYPE "public"."roles_role_name_enum" AS ENUM('admin', 'employer', 'jobseeker')`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_employment_type_enum" AS ENUM('full-time', 'part-time', 'internship', 'contract')`);
        await queryRunner.query(`CREATE TYPE "public"."applications_status_enum" AS ENUM('pending', 'reviewed', 'accepted', 'rejected')`);

        // Create users table
        await queryRunner.query(`CREATE TABLE "users" (
            "user_id" SERIAL NOT NULL,
            "full_name" character varying(100) NOT NULL,
            "email" character varying(100) NOT NULL,
            "password_hash" character varying(255) NOT NULL,
            "phone" character varying(20),
            "status" "public"."users_status_enum" NOT NULL DEFAULT 'active',
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_users_email" UNIQUE ("email"),
            CONSTRAINT "PK_users" PRIMARY KEY ("user_id")
        )`);

        // Create roles table
        await queryRunner.query(`CREATE TABLE "roles" (
            "role_id" SERIAL NOT NULL,
            "role_name" "public"."roles_role_name_enum" NOT NULL,
            "description" character varying(255),
            CONSTRAINT "UQ_roles_role_name" UNIQUE ("role_name"),
            CONSTRAINT "PK_roles" PRIMARY KEY ("role_id")
        )`);

        // Create permissions table
        await queryRunner.query(`CREATE TABLE "permissions" (
            "permission_id" SERIAL NOT NULL,
            "permission_name" character varying(100) NOT NULL,
            "description" character varying(255),
            CONSTRAINT "UQ_permissions_permission_name" UNIQUE ("permission_name"),
            CONSTRAINT "PK_permissions" PRIMARY KEY ("permission_id")
        )`);

        // Create user_roles junction table
        await queryRunner.query(`CREATE TABLE "user_roles" (
            "user_id" integer NOT NULL,
            "role_id" integer NOT NULL,
            CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id")
        )`);

        // Create role_permissions junction table
        await queryRunner.query(`CREATE TABLE "role_permissions" (
            "role_id" integer NOT NULL,
            "permission_id" integer NOT NULL,
            CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")
        )`);

        // Create companies table
        await queryRunner.query(`CREATE TABLE "companies" (
            "company_id" SERIAL NOT NULL,
            "name" character varying(150) NOT NULL,
            "industry" character varying(100),
            "description" text,
            "location" character varying(255),
            "website" character varying(255),
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_companies" PRIMARY KEY ("company_id")
        )`);

        // Create admins table
        await queryRunner.query(`CREATE TABLE "admins" (
            "admin_id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "department" character varying(100),
            "position" character varying(50),
            "permissions" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_admins_user_id" UNIQUE ("user_id"),
            CONSTRAINT "PK_admins" PRIMARY KEY ("admin_id")
        )`);

        // Create job_seekers table
        await queryRunner.query(`CREATE TABLE "job_seekers" (
            "job_seeker_id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "resume_url" character varying(255),
            "skills" text,
            "experience" text,
            "education" text,
            CONSTRAINT "UQ_job_seekers_user_id" UNIQUE ("user_id"),
            CONSTRAINT "PK_job_seekers" PRIMARY KEY ("job_seeker_id")
        )`);

        // Create employers table
        await queryRunner.query(`CREATE TABLE "employers" (
            "employer_id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "company_id" integer,
            "position" character varying(100),
            CONSTRAINT "UQ_employers_user_id" UNIQUE ("user_id"),
            CONSTRAINT "PK_employers" PRIMARY KEY ("employer_id")
        )`);

        // Create job_posts table
        await queryRunner.query(`CREATE TABLE "job_posts" (
            "job_post_id" SERIAL NOT NULL,
            "employer_id" integer NOT NULL,
            "company_id" integer NOT NULL,
            "title" character varying(150) NOT NULL,
            "description" text,
            "requirements" text,
            "salary_range" character varying(50),
            "location" character varying(255),
            "employment_type" "public"."job_posts_employment_type_enum",
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deadline" date,
            CONSTRAINT "PK_job_posts" PRIMARY KEY ("job_post_id")
        )`);

        // Create applications table
        await queryRunner.query(`CREATE TABLE "applications" (
            "application_id" SERIAL NOT NULL,
            "job_post_id" integer NOT NULL,
            "job_seeker_id" integer NOT NULL,
            "status" "public"."applications_status_enum" NOT NULL DEFAULT 'pending',
            "applied_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_applications" PRIMARY KEY ("application_id")
        )`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_admins_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE "job_seekers" ADD CONSTRAINT "FK_job_seekers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_employers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_employers_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_job_posts_employer_id" FOREIGN KEY ("employer_id") REFERENCES "employers"("employer_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_job_posts_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_job_post_id" FOREIGN KEY ("job_post_id") REFERENCES "job_posts"("job_post_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_job_seeker_id" FOREIGN KEY ("job_seeker_id") REFERENCES "job_seekers"("job_seeker_id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_title" ON "job_posts" ("title")`);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_location" ON "job_posts" ("location")`);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_employment_type" ON "job_posts" ("employment_type")`);
        await queryRunner.query(`CREATE INDEX "IDX_applications_status" ON "applications" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_companies_name" ON "companies" ("name")`);
        await queryRunner.query(`CREATE INDEX "IDX_companies_industry" ON "companies" ("industry")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_companies_industry"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_companies_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_applications_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_employment_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_location"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_title"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_job_seeker_id"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_job_post_id"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_job_posts_company_id"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_job_posts_employer_id"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_employers_company_id"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_employers_user_id"`);
        await queryRunner.query(`ALTER TABLE "job_seekers" DROP CONSTRAINT "FK_job_seekers_user_id"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_admins_user_id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission_id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user_id"`);

        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TABLE "job_posts"`);
        await queryRunner.query(`DROP TABLE "employers"`);
        await queryRunner.query(`DROP TABLE "job_seekers"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop ENUM types
        await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_employment_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."roles_role_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }
}