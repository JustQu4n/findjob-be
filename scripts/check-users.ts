import dataSource from '../data-source';

async function checkUsers() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in users table:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkUsers().catch(console.error);
