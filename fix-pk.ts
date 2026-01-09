import dataSource from './data-source';

async function fixPrimaryKey() {
  await dataSource.initialize();
  
  console.log('Checking if primary key exists...');
  const existing = await dataSource.query(`
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'PK_candidate_interviews_id' 
    AND table_name = 'candidate_interviews'
  `);
  
  if (existing.length === 0) {
    console.log('Adding primary key constraint...');
    await dataSource.query(`
      ALTER TABLE candidate_interviews 
      ADD CONSTRAINT "PK_candidate_interviews_id" PRIMARY KEY (candidate_interview_id);
    `);
    console.log('✅ Primary key added successfully!');
  } else {
    console.log('✅ Primary key already exists');
  }
  
  await dataSource.destroy();
}

fixPrimaryKey().catch(console.error);
