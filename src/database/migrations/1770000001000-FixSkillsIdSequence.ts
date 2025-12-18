import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSkillsIdSequence1770000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sequence if not exists
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS skills_id_seq`);

    // Set sequence to max(id)+1 to avoid conflicts
    await queryRunner.query(`SELECT setval('skills_id_seq', COALESCE((SELECT MAX(id) FROM skills), 0) + 1, false)`);

    // Assign ids to rows where id is NULL
    await queryRunner.query(`UPDATE skills SET id = nextval('skills_id_seq') WHERE id IS NULL`);

    // Set default to use the sequence
    await queryRunner.query(`ALTER TABLE skills ALTER COLUMN id SET DEFAULT nextval('skills_id_seq')`);

    // Make column NOT NULL
    await queryRunner.query(`ALTER TABLE skills ALTER COLUMN id SET NOT NULL`);

    // Add primary key constraint if not exists
    const pkExists = await queryRunner.query(`SELECT conname FROM pg_constraint WHERE conrelid = 'skills'::regclass AND contype = 'p'`);
    if (!pkExists || pkExists.length === 0) {
      await queryRunner.query(`ALTER TABLE skills ADD CONSTRAINT pk_skills_id PRIMARY KEY (id)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop primary key if it exists and was created
    await queryRunner.query(`ALTER TABLE IF EXISTS skills DROP CONSTRAINT IF EXISTS pk_skills_id`);

    // Remove default
    await queryRunner.query(`ALTER TABLE skills ALTER COLUMN id DROP DEFAULT`);

    // Optionally leave sequence in place; do not drop to avoid affecting other objects
  }
}
