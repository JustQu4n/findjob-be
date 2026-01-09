import dataSource from '../data-source';

async function checkAllVarcharIds() {
  await dataSource.initialize();
  
  // Get all tables
  const tables = await dataSource.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  
  console.log(`Found ${tables.length} tables. Checking for VARCHAR ID columns...\n`);
  
  let foundVarcharIds = false;
  
  for (const { table_name } of tables) {
    const columns = await dataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = $1 
      AND column_name LIKE '%_id'
      AND data_type = 'character varying'
      ORDER BY ordinal_position;
    `, [table_name]);
    
    if (columns.length > 0) {
      foundVarcharIds = true;
      console.log(`❌ ${table_name}:`);
      console.table(columns);
    }
  }
  
  if (!foundVarcharIds) {
    console.log('✅ All ID columns are using UUID type!');
  }
  
  await dataSource.destroy();
}

checkAllVarcharIds().catch(console.error);
