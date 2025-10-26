-- Reset database script
-- Run this with: psql -U postgres -d findjob_db -f reset-db.sql

-- Drop all tables
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_posts CASCADE;
DROP TABLE IF EXISTS employers CASCADE;
DROP TABLE IF EXISTS job_seekers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS applications_status_enum CASCADE;
DROP TYPE IF EXISTS job_posts_employment_type_enum CASCADE;
DROP TYPE IF EXISTS roles_role_name_enum CASCADE;
DROP TYPE IF EXISTS users_status_enum CASCADE;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Show success message
SELECT 'Database reset successfully!' as message;
