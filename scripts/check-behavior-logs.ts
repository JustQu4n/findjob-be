import dataSource from '../data-source';

async function checkBehaviorLogs() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'candidate_behavior_logs'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in candidate_behavior_logs:');
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
    WHERE tc.table_name = 'candidate_behavior_logs';
  `);
  
  console.log('\nConstraints:');
  console.table(constraints);
  
  const indexes = await dataSource.query(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'candidate_behavior_logs';
  `);
  
  console.log('\nIndexes:');
  console.table(indexes);
  
  await dataSource.destroy();
}

checkBehaviorLogs().catch(console.error);
