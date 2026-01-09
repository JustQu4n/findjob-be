import dataSource from '../data-source';

async function checkQuestions() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'interview_questions'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in interview_questions:');
  console.table(columns);
  
  const constraints = await dataSource.query(`
    SELECT 
      kcu.column_name,
      tc.constraint_type,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'interview_questions';
  `);
  
  console.log('\nConstraints:');
  console.table(constraints);
  
  await dataSource.destroy();
}

checkQuestions().catch(console.error);
