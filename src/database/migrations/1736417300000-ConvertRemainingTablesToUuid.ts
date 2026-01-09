import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertRemainingTablesToUuid1736417300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Phase 1: Convert tables with clean UUID data
    
    // Convert admins table
    await queryRunner.query(`ALTER TABLE admins ALTER COLUMN admin_id TYPE uuid USING admin_id::uuid;`);
    await queryRunner.query(`ALTER TABLE admins ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);

    // Convert applications table
    await queryRunner.query(`ALTER TABLE applications ALTER COLUMN application_id TYPE uuid USING application_id::uuid;`);
    await queryRunner.query(`ALTER TABLE applications ALTER COLUMN job_post_id TYPE uuid USING job_post_id::uuid;`);
    await queryRunner.query(`ALTER TABLE applications ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);

    // Convert categories table
    await queryRunner.query(`ALTER TABLE categories ALTER COLUMN category_id TYPE uuid USING category_id::uuid;`);

    // Convert companies table
    await queryRunner.query(`ALTER TABLE companies ALTER COLUMN company_id TYPE uuid USING company_id::uuid;`);

    // Convert educations table
    await queryRunner.query(`ALTER TABLE educations ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);

    // Convert experiences table
    await queryRunner.query(`ALTER TABLE experiences ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);

    // Convert followed_companies table
    await queryRunner.query(`ALTER TABLE followed_companies ALTER COLUMN followed_company_id TYPE uuid USING followed_company_id::uuid;`);
    await queryRunner.query(`ALTER TABLE followed_companies ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);
    await queryRunner.query(`ALTER TABLE followed_companies ALTER COLUMN company_id TYPE uuid USING company_id::uuid;`);

    // Convert job_post_skills table
    await queryRunner.query(`ALTER TABLE job_post_skills ALTER COLUMN job_post_id TYPE uuid USING job_post_id::uuid;`);

    // Convert job_posts table
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN job_post_id TYPE uuid USING job_post_id::uuid;`);
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN employer_id TYPE uuid USING employer_id::uuid;`);
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN company_id TYPE uuid USING company_id::uuid;`);
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN category_id TYPE uuid USING category_id::uuid;`);

    // Convert notifications table
    await queryRunner.query(`ALTER TABLE notifications ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);

    // Convert permissions table
    await queryRunner.query(`ALTER TABLE permissions ALTER COLUMN permission_id TYPE uuid USING permission_id::uuid;`);

    // Convert post_comments table (empty, safe to convert)
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN post_comment_id TYPE uuid USING post_comment_id::uuid;`);
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN post_id TYPE uuid USING post_id::uuid;`);
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN parent_comment_id TYPE uuid USING CASE WHEN parent_comment_id IS NULL THEN NULL ELSE parent_comment_id::uuid END;`);

    // Convert post_likes table (empty, safe to convert)
    await queryRunner.query(`ALTER TABLE post_likes ALTER COLUMN post_id TYPE uuid USING post_id::uuid;`);
    await queryRunner.query(`ALTER TABLE post_likes ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);

    // Convert post_saves table (empty, safe to convert)
    await queryRunner.query(`ALTER TABLE post_saves ALTER COLUMN post_id TYPE uuid USING post_id::uuid;`);
    await queryRunner.query(`ALTER TABLE post_saves ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);

    // Convert posts table (empty, safe to convert)
    await queryRunner.query(`ALTER TABLE posts ALTER COLUMN post_id TYPE uuid USING post_id::uuid;`);
    await queryRunner.query(`ALTER TABLE posts ALTER COLUMN author_id TYPE uuid USING author_id::uuid;`);

    // Convert projects table
    await queryRunner.query(`ALTER TABLE projects ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);

    // Convert role_permissions table
    await queryRunner.query(`ALTER TABLE role_permissions ALTER COLUMN role_id TYPE uuid USING role_id::uuid;`);
    await queryRunner.query(`ALTER TABLE role_permissions ALTER COLUMN permission_id TYPE uuid USING permission_id::uuid;`);

    // Convert user_skills table
    await queryRunner.query(`ALTER TABLE user_skills ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);

    // Phase 2: Clean up and convert problematic tables
    
    // Fix ai_chat_history - delete rows with non-UUID data (old test data)
    await queryRunner.query(`
      DELETE FROM ai_chat_history 
      WHERE session_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      OR user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    `);
    await queryRunner.query(`ALTER TABLE ai_chat_history ALTER COLUMN session_id TYPE uuid USING session_id::uuid;`);
    await queryRunner.query(`ALTER TABLE ai_chat_history ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);

    // Fix messages - delete empty/invalid messages
    await queryRunner.query(`
      DELETE FROM messages 
      WHERE message_id = '' OR sender_id = ''
      OR message_id IS NULL OR sender_id IS NULL;
    `);
    // Convert attachments first (depends on messages)
    await queryRunner.query(`
      DELETE FROM attachments 
      WHERE message_id = '' OR message_id IS NULL
      OR message_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    `);
    await queryRunner.query(`ALTER TABLE attachments ALTER COLUMN message_id TYPE uuid USING message_id::uuid;`);
    await queryRunner.query(`ALTER TABLE messages ALTER COLUMN message_id TYPE uuid USING message_id::uuid;`);
    await queryRunner.query(`ALTER TABLE messages ALTER COLUMN sender_id TYPE uuid USING sender_id::uuid;`);

    // Fix conversation_participants - delete empty/invalid records
    await queryRunner.query(`
      DELETE FROM conversation_participants 
      WHERE user_id = '' OR user_id IS NULL
      OR user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    `);
    await queryRunner.query(`ALTER TABLE conversation_participants ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`);

    // Fix saved_jobs - delete invalid job_post_id (too long string)
    await queryRunner.query(`
      DELETE FROM saved_jobs 
      WHERE job_post_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    `);
    await queryRunner.query(`ALTER TABLE saved_jobs ALTER COLUMN saved_job_id TYPE uuid USING saved_job_id::uuid;`);
    await queryRunner.query(`ALTER TABLE saved_jobs ALTER COLUMN job_seeker_id TYPE uuid USING job_seeker_id::uuid;`);
    await queryRunner.query(`ALTER TABLE saved_jobs ALTER COLUMN job_post_id TYPE uuid USING job_post_id::uuid;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert in reverse order
    await queryRunner.query(`ALTER TABLE user_skills ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    
    await queryRunner.query(`ALTER TABLE saved_jobs ALTER COLUMN job_post_id TYPE VARCHAR USING job_post_id::text;`);
    await queryRunner.query(`ALTER TABLE saved_jobs ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    await queryRunner.query(`ALTER TABLE saved_jobs ALTER COLUMN saved_job_id TYPE VARCHAR USING saved_job_id::text;`);
    
    await queryRunner.query(`ALTER TABLE role_permissions ALTER COLUMN permission_id TYPE VARCHAR USING permission_id::text;`);
    await queryRunner.query(`ALTER TABLE role_permissions ALTER COLUMN role_id TYPE VARCHAR USING role_id::text;`);
    
    await queryRunner.query(`ALTER TABLE projects ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    
    await queryRunner.query(`ALTER TABLE posts ALTER COLUMN author_id TYPE VARCHAR USING author_id::text;`);
    await queryRunner.query(`ALTER TABLE posts ALTER COLUMN post_id TYPE VARCHAR USING post_id::text;`);
    
    await queryRunner.query(`ALTER TABLE post_saves ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    await queryRunner.query(`ALTER TABLE post_saves ALTER COLUMN post_id TYPE VARCHAR USING post_id::text;`);
    
    await queryRunner.query(`ALTER TABLE post_likes ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    await queryRunner.query(`ALTER TABLE post_likes ALTER COLUMN post_id TYPE VARCHAR USING post_id::text;`);
    
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN parent_comment_id TYPE VARCHAR USING parent_comment_id::text;`);
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN post_id TYPE VARCHAR USING post_id::text;`);
    await queryRunner.query(`ALTER TABLE post_comments ALTER COLUMN post_comment_id TYPE VARCHAR USING post_comment_id::text;`);
    
    await queryRunner.query(`ALTER TABLE permissions ALTER COLUMN permission_id TYPE VARCHAR USING permission_id::text;`);
    await queryRunner.query(`ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    
    await queryRunner.query(`ALTER TABLE messages ALTER COLUMN sender_id TYPE VARCHAR USING sender_id::text;`);
    await queryRunner.query(`ALTER TABLE messages ALTER COLUMN message_id TYPE VARCHAR USING message_id::text;`);
    
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN category_id TYPE VARCHAR USING category_id::text;`);
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN company_id TYPE VARCHAR USING company_id::text;`);
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN employer_id TYPE VARCHAR USING employer_id::text;`);
    await queryRunner.query(`ALTER TABLE job_posts ALTER COLUMN job_post_id TYPE VARCHAR USING job_post_id::text;`);
    
    await queryRunner.query(`ALTER TABLE job_post_skills ALTER COLUMN job_post_id TYPE VARCHAR USING job_post_id::text;`);
    
    await queryRunner.query(`ALTER TABLE followed_companies ALTER COLUMN company_id TYPE VARCHAR USING company_id::text;`);
    await queryRunner.query(`ALTER TABLE followed_companies ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    await queryRunner.query(`ALTER TABLE followed_companies ALTER COLUMN followed_company_id TYPE VARCHAR USING followed_company_id::text;`);
    
    await queryRunner.query(`ALTER TABLE experiences ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    await queryRunner.query(`ALTER TABLE educations ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    await queryRunner.query(`ALTER TABLE conversation_participants ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    await queryRunner.query(`ALTER TABLE companies ALTER COLUMN company_id TYPE VARCHAR USING company_id::text;`);
    await queryRunner.query(`ALTER TABLE categories ALTER COLUMN category_id TYPE VARCHAR USING category_id::text;`);
    await queryRunner.query(`ALTER TABLE attachments ALTER COLUMN message_id TYPE VARCHAR USING message_id::text;`);
    
    await queryRunner.query(`ALTER TABLE applications ALTER COLUMN job_seeker_id TYPE VARCHAR USING job_seeker_id::text;`);
    await queryRunner.query(`ALTER TABLE applications ALTER COLUMN job_post_id TYPE VARCHAR USING job_post_id::text;`);
    await queryRunner.query(`ALTER TABLE applications ALTER COLUMN application_id TYPE VARCHAR USING application_id::text;`);
    
    await queryRunner.query(`ALTER TABLE ai_chat_history ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    await queryRunner.query(`ALTER TABLE ai_chat_history ALTER COLUMN session_id TYPE VARCHAR USING session_id::text;`);
    
    await queryRunner.query(`ALTER TABLE admins ALTER COLUMN user_id TYPE VARCHAR USING user_id::text;`);
    await queryRunner.query(`ALTER TABLE admins ALTER COLUMN admin_id TYPE VARCHAR USING admin_id::text;`);
  }
}
