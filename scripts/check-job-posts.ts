import dataSource from '../data-source';

async function checkJobPosts() {
  await dataSource.initialize();
  
  const columns = await dataSource.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'job_posts'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in job_posts:');
  console.table(columns);
  
  await dataSource.destroy();
}

checkJobPosts().catch(console.error);
