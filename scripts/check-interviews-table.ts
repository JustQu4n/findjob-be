import dataSource from '../data-source';

async function checkInterviews() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'interviews'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in interviews table:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkInterviews().catch(console.error);
