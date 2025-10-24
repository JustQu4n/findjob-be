import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRolesAndPermissions1727721700000 implements MigrationInterface {
    name = 'SeedRolesAndPermissions1727721700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert default roles
        await queryRunner.query(`
            INSERT INTO "roles" ("role_name", "description") VALUES 
            ('admin', 'Administrator with full system access'),
            ('employer', 'Company representative who can post jobs and manage applications'),
            ('jobseeker', 'Job seeker who can apply for jobs and manage profile')
        `);

        // Insert default permissions
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

        // Assign permissions to roles
        
        // Admin role gets all permissions
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.role_id, p.permission_id 
            FROM "roles" r, "permissions" p 
            WHERE r.role_name = 'admin'
        `);

        // Employer role permissions
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

        // Job seeker role permissions
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete role permissions
        await queryRunner.query(`DELETE FROM "role_permissions"`);
        
        // Delete permissions
        await queryRunner.query(`DELETE FROM "permissions"`);
        
        // Delete roles
        await queryRunner.query(`DELETE FROM "roles"`);
    }
}