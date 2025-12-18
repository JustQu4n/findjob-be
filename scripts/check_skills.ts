import dataSource from '../data-source';

async function main() {
  const ds = dataSource;
  await ds.initialize();
  const res = await ds.query(
    `SELECT column_name, data_type, udt_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'id'`
  );
  console.log(JSON.stringify(res, null, 2));
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
