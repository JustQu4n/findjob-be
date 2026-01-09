import dataSource from '../data-source';

async function checkEvaluations() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'interview_ai_evaluations'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in interview_ai_evaluations:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkEvaluations().catch(console.error);
