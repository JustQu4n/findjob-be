import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class CreateJobPostEmbeddings1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE job_post_embeddings(
        embedding_id uuid NOT NULL DEFAULT uuid_generate_v4(),
        job_post_id uuid NOT NULL,
        embedding_vector vector NOT NULL,
        model_name varchar(50) NOT NULL,
        embedding_version varchar(20) NOT NULL DEFAULT 'v1'::character varying,
        created_at timestamp without time zone DEFAULT now(),
        metadata jsonb,
        embedding_content text NOT NULL,
        PRIMARY KEY(embedding_id)
      );
    `);

    // Try to discover a suitable referenced column on job_posts (prefer job_post_id)
    const jobPostsTable = await queryRunner.getTable('job_posts');
    if (jobPostsTable) {
      let referencedColumn = 'job_post_id';
      const hasJobPostId = jobPostsTable.columns.some((c) => c.name === 'job_post_id');
      const jobPostIdIsPk = jobPostsTable.primaryColumns.some((c) => c.name === 'job_post_id');

      if (!hasJobPostId || !jobPostIdIsPk) {
        if (jobPostsTable.primaryColumns.length > 0) {
          referencedColumn = jobPostsTable.primaryColumns[0].name;
        } else {
          // no suitable primary key found, skip creating FK
          referencedColumn = '';
        }
      }

      if (referencedColumn) {
        await queryRunner.createForeignKey(
          'job_post_embeddings',
          new TableForeignKey({
            columnNames: ['job_post_id'],
            referencedTableName: 'job_posts',
            referencedColumnNames: [referencedColumn],
            onDelete: 'CASCADE',
          }),
        );
      }
    }

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_job_post_embeddings_job_post_id ON job_post_embeddings(job_post_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_job_post_embeddings_created_at ON job_post_embeddings(created_at DESC)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('job_post_embeddings');
    if (table) {
      const fk = table.foreignKeys.find((f) => f.columnNames.indexOf('job_post_id') !== -1);
      if (fk) {
        await queryRunner.dropForeignKey('job_post_embeddings', fk);
      }
    }

    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_post_embeddings_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_post_embeddings_job_post_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_post_embeddings`);
  }
}
