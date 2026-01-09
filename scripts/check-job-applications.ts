import dataSource from '../data-source';

async function checkJobApplications() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'job_applications'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in job_applications:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkJobApplications().catch(console.error);
