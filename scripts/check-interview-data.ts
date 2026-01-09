import dataSource from '../data-source';

async function checkData() {
  await dataSource.initialize();
  
  const count = await dataSource.query(`
    SELECT COUNT(*) as count FROM candidate_interviews;
  `);
  
  console.log('Total rows:', count[0].count);
  
  if (parseInt(count[0].count) > 0) {
    const samples = await dataSource.query(`
      SELECT candidate_interview_id, interview_id, status 
      FROM candidate_interviews 
      LIMIT 5;
    `);
    
    console.log('\nSample data:');
    console.table(samples);
  }
  
  await dataSource.destroy();
}

checkData().catch(console.error);
