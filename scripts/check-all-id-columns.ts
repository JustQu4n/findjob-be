import dataSource from '../data-source';

async function checkAllTables() {
  await dataSource.initialize();
  
  // Check all tables that might have VARCHAR IDs
  const tables = [
    'candidate_answers',
    'job_applications', 
    'ai_interview_evaluations',
    'users',
    'employers',
    'companies'
  ];
  
  for (const table of tables) {
    try {
      const columns = await dataSource.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name LIKE '%_id'
        ORDER BY ordinal_position;
      `, [table]);
      
      if (columns.length > 0) {
        console.log(`\n${table}:`);
        console.table(columns);
      }
    } catch (e) {
      // Table doesn't exist, skip
    }
  }
  
  await dataSource.destroy();
}

checkAllTables().catch(console.error);
