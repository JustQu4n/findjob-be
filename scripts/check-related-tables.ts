import dataSource from '../data-source';

async function checkRelatedTables() {
  await dataSource.initialize();
  
  // Check candidate_answers table
  const answersColumns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'candidate_answers'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in candidate_answers:');
  console.table(answersColumns);
  
  // Check job_applications table
  const applicationsColumns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'job_applications'
    ORDER BY ordinal_position;
  `);
  
  console.log('\nColumns in job_applications:');
  console.table(applicationsColumns);
  
  await dataSource.destroy();
}

checkRelatedTables().catch(console.error);
