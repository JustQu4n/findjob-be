import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAiChatHistory1765000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_chat_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_message',
            type: 'text',
          },
          {
            name: 'ai_response',
            type: 'text',
          },
          {
            name: 'model',
            type: 'varchar',
            length: '50',
            default: "'gemini-1.5-flash'",
          },
          {
            name: 'tokens_used',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'user_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'ai_chat_history',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Create index for faster queries
    await queryRunner.query(
      `CREATE INDEX idx_ai_chat_history_user_id ON ai_chat_history(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_chat_history_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_chat_history_user_id`);
    
    const table = await queryRunner.getTable('ai_chat_history');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('ai_chat_history', foreignKey);
      }
    }
    
    await queryRunner.dropTable('ai_chat_history');
  }
}
