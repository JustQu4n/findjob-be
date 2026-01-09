import { DataSource } from 'typeorm';
import dataSource from './data-source';

async function checkTable() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, character_maximum_length, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'candidate_interviews'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in candidate_interviews:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkTable().catch(console.error);
