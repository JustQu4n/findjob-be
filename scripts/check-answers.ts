import dataSource from '../data-source';

async function checkAnswers() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'interview_answers'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in interview_answers:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkAnswers().catch(console.error);
