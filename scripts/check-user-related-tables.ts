import dataSource from '../data-source';

async function checkRelatedTables() {
  await dataSource.initialize();
  
  const tables = ['user_roles', 'job_seekers', 'employers', 'roles'];
  
  for (const table of tables) {
    const columns = await dataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name LIKE '%_id'
      ORDER BY ordinal_position;
    `, [table]);
    
    if (columns.length > 0) {
      console.log(`\n${table}:`);
      console.table(columns);
    }
  }
  
  await dataSource.destroy();
}

checkRelatedTables().catch(console.error);
