import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function checkNonUuidData() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    const tablesToCheck = [
      { table: 'admins', columns: ['admin_id', 'user_id'] },
      { table: 'ai_chat_history', columns: ['session_id', 'user_id'] },
      { table: 'applications', columns: ['application_id', 'job_post_id', 'job_seeker_id'] },
      { table: 'attachments', columns: ['message_id'] },
      { table: 'categories', columns: ['category_id'] },
      { table: 'companies', columns: ['company_id'] },
      { table: 'conversation_participants', columns: ['user_id'] },
      { table: 'educations', columns: ['job_seeker_id'] },
      { table: 'experiences', columns: ['job_seeker_id'] },
      { table: 'followed_companies', columns: ['followed_company_id', 'job_seeker_id', 'company_id'] },
      { table: 'job_post_skills', columns: ['job_post_id'] },
      { table: 'job_posts', columns: ['job_post_id', 'employer_id', 'company_id', 'category_id'] },
      { table: 'messages', columns: ['message_id', 'sender_id'] },
      { table: 'notifications', columns: ['user_id'] },
      { table: 'permissions', columns: ['permission_id'] },
      { table: 'post_comments', columns: ['post_comment_id', 'post_id', 'user_id', 'parent_comment_id'] },
      { table: 'post_likes', columns: ['post_id', 'user_id'] },
      { table: 'post_saves', columns: ['post_id', 'user_id'] },
      { table: 'posts', columns: ['post_id', 'author_id'] },
      { table: 'projects', columns: ['job_seeker_id'] },
      { table: 'role_permissions', columns: ['role_id', 'permission_id'] },
      { table: 'saved_jobs', columns: ['saved_job_id', 'job_seeker_id', 'job_post_id'] },
      { table: 'user_skills', columns: ['job_seeker_id'] },
    ];

    const nonUuidTables: string[] = [];

    for (const { table, columns } of tablesToCheck) {
      try {
        // Check if table has any rows
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const rowCount = parseInt(countResult.rows[0].count);
        
        if (rowCount === 0) {
          console.log(`✅ ${table}: Empty (no data to check)`);
          continue;
        }

        let hasNonUuid = false;
        const badColumns: Array<{column: string, badCount: number, samples: string[]}> = [];

        for (const column of columns) {
          // Try to cast to uuid and find rows that fail
          const checkQuery = `
            SELECT COUNT(*) as bad_count 
            FROM ${table} 
            WHERE ${column} IS NOT NULL 
            AND ${column} !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          `;
          
          const result = await client.query(checkQuery);
          const badCount = parseInt(result.rows[0].bad_count);
          
          if (badCount > 0) {
            hasNonUuid = true;
            // Get sample of bad values
            const sampleQuery = `
              SELECT ${column} 
              FROM ${table} 
              WHERE ${column} IS NOT NULL 
              AND ${column} !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              LIMIT 3
            `;
            const samples = await client.query(sampleQuery);
            badColumns.push({
              column,
              badCount,
              samples: samples.rows.map(r => r[column])
            });
          }
        }

        if (hasNonUuid) {
          console.log(`❌ ${table}: Has non-UUID data (${rowCount} rows total)`);
          for (const { column, badCount, samples } of badColumns) {
            console.log(`   - ${column}: ${badCount} non-UUID values`);
            console.log(`     Examples: ${samples.join(', ')}`);
          }
          nonUuidTables.push(table);
        } else {
          console.log(`✅ ${table}: All values are UUID format (${rowCount} rows)`);
        }
      } catch (error) {
        console.log(`⚠️  ${table}: Error checking - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    if (nonUuidTables.length > 0) {
      console.log(`\n⚠️  ${nonUuidTables.length} tables have non-UUID data:`);
      console.log(nonUuidTables.map(t => `   - ${t}`).join('\n'));
      console.log('\nThese tables need data cleanup before UUID conversion.');
    } else {
      console.log('\n✅ All tables have UUID-compatible data!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkNonUuidData();
