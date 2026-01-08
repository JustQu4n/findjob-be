import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCriteriaToInterviewQuestion1736338800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'interview_questions',
      new TableColumn({
        name: 'criteria',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('interview_questions', 'criteria');
  }
}
