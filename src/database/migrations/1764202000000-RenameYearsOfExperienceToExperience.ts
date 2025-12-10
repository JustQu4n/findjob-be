import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameYearsOfExperienceToExperience1764202000000 implements MigrationInterface {
  name = 'RenameYearsOfExperienceToExperience1764202000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // If years_of_experience exists and experience does not, rename it.
    // If both exist, copy non-null values then drop years_of_experience.
    await queryRunner.query(`DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='job_seekers' AND column_name='years_of_experience'
      ) THEN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='job_seekers' AND column_name='experience'
        ) THEN
          EXECUTE 'ALTER TABLE "job_seekers" RENAME COLUMN "years_of_experience" TO "experience"';
        ELSE
          -- Copy values where experience is null, then drop the old column
          EXECUTE 'UPDATE "job_seekers" SET "experience" = "years_of_experience" WHERE "experience" IS NULL';
          EXECUTE 'ALTER TABLE "job_seekers" DROP COLUMN IF EXISTS "years_of_experience"';
        END IF;
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: if experience exists and years_of_experience does not, rename back
    await queryRunner.query(`DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='job_seekers' AND column_name='experience'
      ) THEN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='job_seekers' AND column_name='years_of_experience'
        ) THEN
          EXECUTE 'ALTER TABLE "job_seekers" RENAME COLUMN "experience" TO "years_of_experience"';
        ELSE
          -- Copy values where years_of_experience is null, then drop experience
          EXECUTE 'UPDATE "job_seekers" SET "years_of_experience" = "experience" WHERE "years_of_experience" IS NULL';
          EXECUTE 'ALTER TABLE "job_seekers" DROP COLUMN IF EXISTS "experience"';
        END IF;
      END IF;
    END$$;`);
  }
}
