import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1761454034209 implements MigrationInterface {
    name = 'InitialSchema1761454034209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create ENUM types
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."roles_role_name_enum" AS ENUM('admin', 'employer', 'jobseeker')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."job_posts_employment_type_enum" AS ENUM('full-time', 'part-time', 'internship', 'contract')
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."applications_status_enum" AS ENUM('pending', 'reviewed', 'accepted', 'rejected')
        `);

        // ==================== CORE TABLES ====================
        
        // Users table (user_id first column)
        await queryRunner.query(`
            CREATE TABLE "users" (
                "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "full_name" varchar(100) NOT NULL,
                "email" varchar(100) NOT NULL,
                "password_hash" varchar(255) NOT NULL,
                "phone" varchar(20),
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'active',
                "is_email_verified" boolean NOT NULL DEFAULT false,
                "email_verification_token" varchar(255),
                "email_verification_token_expires" TIMESTAMP,
                "password_reset_token" varchar(255),
                "password_reset_token_expires" TIMESTAMP,
                "refresh_token" varchar(500),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_3ca2c4bc027264e187deb66547" ON "users" ("status")`);

        // Roles table (role_id first column)
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "role_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "role_name" "public"."roles_role_name_enum" NOT NULL,
                "description" varchar(255),
                CONSTRAINT "UQ_ac35f51a0f17e3e9c2f685e7c43" UNIQUE ("role_name"),
                CONSTRAINT "PK_09f4c8130b54f35925588a37b6a" PRIMARY KEY ("role_id")
            )
        `);

        // Permissions table (permission_id first column)
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "permission_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "permission_name" varchar(100) NOT NULL,
                "description" varchar(255),
                CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("permission_name"),
                CONSTRAINT "PK_1717db2235a5b169822e7f753b1" PRIMARY KEY ("permission_id")
            )
        `);

        // Companies table (company_id first column)
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "company_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar(150) NOT NULL,
                "industry" varchar(100),
                "description" text,
                "location" varchar(255),
                "website" varchar(255),
                "logo_url" varchar(500),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_8c008cd5c4c0c20cf1e77f68e8d" PRIMARY KEY ("company_id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name")`);
        await queryRunner.query(`CREATE INDEX "IDX_0acc8dda853c271fba32a83a8e" ON "companies" ("industry")`);

        // ==================== USER TYPE TABLES ====================

        // Admins table (admin_id first column)
        await queryRunner.query(`
            CREATE TABLE "admins" (
                "admin_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "department" varchar(100),
                "position" varchar(50),
                "permissions" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_2b901dd818a2a6486994d915a68" UNIQUE ("user_id"),
                CONSTRAINT "PK_88070d08be64522fc84fdefef85" PRIMARY KEY ("admin_id"),
                CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("user_id") ON DELETE NO ACTION
            )
        `);

        // Job Seekers table (job_seeker_id first column)
        await queryRunner.query(`
            CREATE TABLE "job_seekers" (
                "job_seeker_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "resume_url" varchar(255),
                "skills" text,
                "experience" text,
                "education" text,
                CONSTRAINT "UQ_2e6598127070580810c62369b10" UNIQUE ("user_id"),
                CONSTRAINT "PK_eb6a84f9e41d3c3e2cef5595f03" PRIMARY KEY ("job_seeker_id"),
                CONSTRAINT "FK_2e6598127070580810c62369b10" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("user_id") ON DELETE NO ACTION
            )
        `);

        // Employers table (employer_id first column)
        await queryRunner.query(`
            CREATE TABLE "employers" (
                "employer_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "company_id" uuid,
                "position" varchar(100),
                CONSTRAINT "UQ_b5db2de89197ada09695cbaf900" UNIQUE ("user_id"),
                CONSTRAINT "PK_2c00bb5152c6ec364a0ddadaa51" PRIMARY KEY ("employer_id"),
                CONSTRAINT "FK_b5db2de89197ada09695cbaf900" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("user_id") ON DELETE NO ACTION,
                CONSTRAINT "FK_15d98d0d36739f69ebb75d767a7" FOREIGN KEY ("company_id") 
                    REFERENCES "companies"("company_id") ON DELETE SET NULL
            )
        `);

        // ==================== BUSINESS TABLES ====================

        // Job Posts table (job_post_id first column)
        await queryRunner.query(`
            CREATE TABLE "job_posts" (
                "job_post_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "employer_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                "title" varchar(150) NOT NULL,
                "description" text,
                "requirements" text,
                "salary_range" varchar(50),
                "location" varchar(255),
                "employment_type" "public"."job_posts_employment_type_enum",
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "deadline" date,
                CONSTRAINT "PK_11d2c2266f88c070934fd2733f2" PRIMARY KEY ("job_post_id"),
                CONSTRAINT "FK_784301bc05fc0073e852211f17c" FOREIGN KEY ("employer_id") 
                    REFERENCES "employers"("employer_id") ON DELETE CASCADE,
                CONSTRAINT "FK_99666f01665f814e46461e21d3b" FOREIGN KEY ("company_id") 
                    REFERENCES "companies"("company_id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_9e700e41b7f764d22c1da8d409" ON "job_posts" ("title")`);
        await queryRunner.query(`CREATE INDEX "IDX_b690a90b3ac3f7b85e7c2ac30f" ON "job_posts" ("location")`);
        await queryRunner.query(`CREATE INDEX "IDX_25db41cd6f1d9ad93ed5a85e7f" ON "job_posts" ("employment_type")`);

        // Applications table (application_id first column)
        await queryRunner.query(`
            CREATE TABLE "applications" (
                "application_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "job_post_id" uuid NOT NULL,
                "job_seeker_id" uuid NOT NULL,
                "status" "public"."applications_status_enum" NOT NULL DEFAULT 'pending',
                "applied_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_418038704e50c663590feb7f511" PRIMARY KEY ("application_id"),
                CONSTRAINT "FK_24456c013c27621eb6ba693c5f1" FOREIGN KEY ("job_post_id") 
                    REFERENCES "job_posts"("job_post_id") ON DELETE CASCADE,
                CONSTRAINT "FK_de581fac8611f95c4a26859597f" FOREIGN KEY ("job_seeker_id") 
                    REFERENCES "job_seekers"("job_seeker_id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_3d7cf5c8f5d54bc74b2e7cd3b9" ON "applications" ("status")`);

        // ==================== JUNCTION TABLES ====================

        // User Roles (composite primary key)
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "user_id" uuid NOT NULL,
                "role_id" uuid NOT NULL,
                CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"),
                CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("user_id") ON DELETE CASCADE,
                CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") 
                    REFERENCES "roles"("role_id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id")`);

        // Role Permissions (composite primary key)
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "role_id" uuid NOT NULL,
                "permission_id" uuid NOT NULL,
                CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"),
                CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") 
                    REFERENCES "roles"("role_id") ON DELETE CASCADE,
                CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") 
                    REFERENCES "permissions"("permission_id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id")`);

        // ==================== SEED DATA ====================

        // Seed Roles
        await queryRunner.query(`
            INSERT INTO "roles" ("role_name", "description") VALUES
            ('admin', 'Administrator with full system access'),
            ('employer', 'Company representative who can post jobs and manage applications'),
            ('jobseeker', 'Job seeker who can apply for jobs and manage profile')
        `);

        // Seed Permissions
        await queryRunner.query(`
            INSERT INTO "permissions" ("permission_name", "description") VALUES
            -- Admin permissions
            ('manage_users', 'Create, read, update, delete users'),
            ('manage_companies', 'Create, read, update, delete companies'),
            ('manage_roles', 'Create, read, update, delete roles'),
            ('manage_permissions', 'Create, read, update, delete permissions'),
            ('view_analytics', 'View system analytics and reports'),
            
            -- Employer permissions
            ('create_job_posts', 'Create new job postings'),
            ('manage_job_posts', 'Edit and delete own job postings'),
            ('view_applications', 'View applications for own job postings'),
            ('manage_applications', 'Accept, reject, or update application status'),
            ('manage_company_profile', 'Update company information'),
            
            -- Job seeker permissions
            ('apply_for_jobs', 'Apply for job postings'),
            ('manage_profile', 'Update own profile information'),
            ('upload_resume', 'Upload and manage resume files'),
            ('view_job_posts', 'Browse and search job postings'),
            ('track_applications', 'View own application status and history'),
            
            -- Common permissions
            ('view_profile', 'View own profile'),
            ('update_profile', 'Update own basic profile information'),
            ('change_password', 'Change own password')
        `);

        // Assign all permissions to admin role
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.role_id, p.permission_id
            FROM "roles" r, "permissions" p
            WHERE r.role_name = 'admin'
        `);

        // Assign employer permissions
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.role_id, p.permission_id
            FROM "roles" r, "permissions" p
            WHERE r.role_name = 'employer'
            AND p.permission_name IN (
                'create_job_posts',
                'manage_job_posts',
                'view_applications',
                'manage_applications',
                'manage_company_profile',
                'view_profile',
                'update_profile',
                'change_password'
            )
        `);

        // Assign jobseeker permissions
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.role_id, p.permission_id
            FROM "roles" r, "permissions" p
            WHERE r.role_name = 'jobseeker'
            AND p.permission_name IN (
                'apply_for_jobs',
                'manage_profile',
                'upload_resume',
                'view_job_posts',
                'track_applications',
                'view_profile',
                'update_profile',
                'change_password'
            )
        `);

        // Seed Sample Users
        await queryRunner.query(`
            INSERT INTO "users" ("full_name", "email", "password_hash", "phone", "status") VALUES
            -- Admin user
            ('Admin User', 'admin@careervibe.com', '$2b$10$YourHashedPasswordHere1', '+84901234567', 'active'),
            
            -- Employer users
            ('John Smith', 'john.smith@techcorp.com', '$2b$10$YourHashedPasswordHere2', '+84901234568', 'active'),
            ('Sarah Johnson', 'sarah.johnson@innovatetech.com', '$2b$10$YourHashedPasswordHere3', '+84901234569', 'active'),
            ('Michael Chen', 'michael.chen@globalsoft.com', '$2b$10$YourHashedPasswordHere4', '+84901234570', 'active'),
            ('Emily Davis', 'emily.davis@startupco.com', '$2b$10$YourHashedPasswordHere5', '+84901234571', 'active'),
            
            -- Job seeker users
            ('Nguyen Van An', 'nguyenvanan@gmail.com', '$2b$10$YourHashedPasswordHere6', '+84901234572', 'active'),
            ('Tran Thi Binh', 'tranthibinh@gmail.com', '$2b$10$YourHashedPasswordHere7', '+84901234573', 'active'),
            ('Le Quoc Cuong', 'lequoccuong@gmail.com', '$2b$10$YourHashedPasswordHere8', '+84901234574', 'active'),
            ('Pham Thi Dung', 'phamthidung@gmail.com', '$2b$10$YourHashedPasswordHere9', '+84901234575', 'active'),
            ('Hoang Van Duc', 'hoangvanduc@gmail.com', '$2b$10$YourHashedPasswordHere10', '+84901234576', 'active')
        `);

        // Assign roles to users
        await queryRunner.query(`
            INSERT INTO "user_roles" ("user_id", "role_id")
            SELECT u.user_id, r.role_id FROM "users" u, "roles" r
            WHERE u.email = 'admin@careervibe.com' AND r.role_name = 'admin'
            
            UNION ALL
            
            SELECT u.user_id, r.role_id FROM "users" u, "roles" r
            WHERE u.email IN ('john.smith@techcorp.com', 'sarah.johnson@innovatetech.com', 
                              'michael.chen@globalsoft.com', 'emily.davis@startupco.com')
            AND r.role_name = 'employer'
            
            UNION ALL
            
            SELECT u.user_id, r.role_id FROM "users" u, "roles" r
            WHERE u.email IN ('nguyenvanan@gmail.com', 'tranthibinh@gmail.com', 
                              'lequoccuong@gmail.com', 'phamthidung@gmail.com', 'hoangvanduc@gmail.com')
            AND r.role_name = 'jobseeker'
        `);

        // Seed Companies
        await queryRunner.query(`
            INSERT INTO "companies" ("name", "industry", "description", "location", "website") VALUES
            ('TechCorp Vietnam', 'Technology', 'Leading technology company specializing in software development and digital transformation solutions.', 'Ho Chi Minh City, Vietnam', 'https://techcorp.vn'),
            ('InnovateTech Solutions', 'Information Technology', 'Innovative IT solutions provider focusing on cloud computing, AI, and machine learning technologies.', 'Hanoi, Vietnam', 'https://innovatetech.com.vn'),
            ('GlobalSoft International', 'Software Development', 'Global software development company with expertise in enterprise applications and mobile solutions.', 'Da Nang, Vietnam', 'https://globalsoft.com'),
            ('StartupCo', 'Fintech', 'Fast-growing fintech startup revolutionizing digital payments and financial services in Vietnam.', 'Ho Chi Minh City, Vietnam', 'https://startupco.vn')
        `);

        // Seed Admins
        await queryRunner.query(`
            INSERT INTO "admins" ("user_id", "department", "position", "permissions")
            SELECT user_id, 'System Administration', 'Super Admin', 
                   '{"users": ["read", "create", "update", "delete"], "companies": ["read", "create", "update", "delete"]}'
            FROM "users" WHERE email = 'admin@careervibe.com'
        `);

        // Seed Employers
        await queryRunner.query(`
            INSERT INTO "employers" ("user_id", "company_id", "position")
            SELECT u.user_id, c.company_id, 
                   CASE 
                       WHEN u.email = 'john.smith@techcorp.com' THEN 'Senior HR Manager'
                       WHEN u.email = 'sarah.johnson@innovatetech.com' THEN 'Technical Recruiter'
                       WHEN u.email = 'michael.chen@globalsoft.com' THEN 'Hiring Manager'
                       WHEN u.email = 'emily.davis@startupco.com' THEN 'Head of People Operations'
                   END
            FROM "users" u
            CROSS JOIN "companies" c
            WHERE (u.email = 'john.smith@techcorp.com' AND c.name = 'TechCorp Vietnam')
               OR (u.email = 'sarah.johnson@innovatetech.com' AND c.name = 'InnovateTech Solutions')
               OR (u.email = 'michael.chen@globalsoft.com' AND c.name = 'GlobalSoft International')
               OR (u.email = 'emily.davis@startupco.com' AND c.name = 'StartupCo')
        `);

        // Seed Job Seekers
        await queryRunner.query(`
            INSERT INTO "job_seekers" ("user_id", "resume_url", "skills", "experience", "education")
            SELECT 
                user_id,
                'https://storage.careervibe.com/resumes/' || LOWER(REPLACE(full_name, ' ', '_')) || '.pdf',
                CASE 
                    WHEN email = 'nguyenvanan@gmail.com' THEN 'JavaScript, React, Node.js, MongoDB, TypeScript'
                    WHEN email = 'tranthibinh@gmail.com' THEN 'Java, Spring Boot, MySQL, Docker, Kubernetes'
                    WHEN email = 'lequoccuong@gmail.com' THEN 'Python, Django, PostgreSQL, Redis, Machine Learning'
                    WHEN email = 'phamthidung@gmail.com' THEN 'UI/UX Design, Figma, Adobe Creative Suite'
                    WHEN email = 'hoangvanduc@gmail.com' THEN 'DevOps, AWS, Terraform, Docker, Kubernetes'
                END,
                '2-3 years of experience in software development',
                'Bachelor of Computer Science'
            FROM "users"
            WHERE email IN ('nguyenvanan@gmail.com', 'tranthibinh@gmail.com', 'lequoccuong@gmail.com', 
                           'phamthidung@gmail.com', 'hoangvanduc@gmail.com')
        `);

        // Seed Job Posts
        await queryRunner.query(`
            INSERT INTO "job_posts" ("employer_id", "company_id", "title", "description", "requirements", "salary_range", "location", "employment_type", "deadline")
            SELECT 
                e.employer_id,
                e.company_id,
                'Senior Frontend Developer',
                'We are looking for a Senior Frontend Developer to join our dynamic team.',
                'Bachelor degree in Computer Science. 3+ years of experience with React/Vue.js.',
                '25,000,000 - 35,000,000 VND',
                'Ho Chi Minh City',
                'full-time'::"public"."job_posts_employment_type_enum",
                CURRENT_DATE + INTERVAL '30 days'
            FROM "employers" e
            INNER JOIN "users" u ON e.user_id = u.user_id
            WHERE u.email = 'john.smith@techcorp.com'
            
            UNION ALL
            
            SELECT 
                e.employer_id,
                e.company_id,
                'DevOps Engineer',
                'We need a DevOps Engineer to help us scale our infrastructure.',
                'Bachelor degree in IT. 2+ years of DevOps experience with AWS/Azure.',
                '28,000,000 - 40,000,000 VND',
                'Hanoi',
                'full-time'::"public"."job_posts_employment_type_enum",
                CURRENT_DATE + INTERVAL '20 days'
            FROM "employers" e
            INNER JOIN "users" u ON e.user_id = u.user_id
            WHERE u.email = 'sarah.johnson@innovatetech.com'
            
            UNION ALL
            
            SELECT 
                e.employer_id,
                e.company_id,
                'Full Stack Developer',
                'Join our team to work on enterprise applications.',
                'Bachelor degree. 3+ years of Java and React experience.',
                '30,000,000 - 45,000,000 VND',
                'Da Nang',
                'full-time'::"public"."job_posts_employment_type_enum",
                CURRENT_DATE + INTERVAL '25 days'
            FROM "employers" e
            INNER JOIN "users" u ON e.user_id = u.user_id
            WHERE u.email = 'michael.chen@globalsoft.com'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all tables in reverse order
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "applications" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "job_posts" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "employers" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "job_seekers" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "admins" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "companies" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        
        // Drop ENUM types
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."applications_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."job_posts_employment_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."roles_role_name_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
        
        // Drop extension
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }

}
