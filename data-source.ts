import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

const dataSourceOptions: any = {
  type: 'postgres',
  entities: ['src/database/entities/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

if (process.env.DATABASE_URL) {
  dataSourceOptions.url = process.env.DATABASE_URL;
  // Render Postgres requires SSL; disable certificate verification for Node client
  dataSourceOptions.ssl = { rejectUnauthorized: false };
} else {
  dataSourceOptions.host = process.env.DB_HOST || 'localhost';
  dataSourceOptions.port = parseInt(process.env.DB_PORT || '5432', 10);
  dataSourceOptions.username = process.env.DB_USERNAME || 'careervibe';
  dataSourceOptions.password = process.env.DB_PASSWORD || 'Careervibe@123';
  dataSourceOptions.database = process.env.DB_DATABASE || 'careervibe_db';
  if (process.env.DB_HOST && process.env.DB_HOST.includes('render.com')) {
    dataSourceOptions.ssl = { rejectUnauthorized: false };
  }
}

export default new DataSource(dataSourceOptions);