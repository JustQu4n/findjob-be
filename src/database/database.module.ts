import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import databaseConfig from "src/config/database.config";

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    // TypeORM Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const baseOptions: any = {
          type: 'postgres',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: configService.get('database.logging'),
        };

        if (process.env.DATABASE_URL) {
          baseOptions.url = process.env.DATABASE_URL;
          // When using a DATABASE_URL on platforms like Render, pass SSL options
          // through `extra` so the underlying pg driver uses TLS without
          // rejecting self-signed certificates.
          baseOptions.extra = { ssl: { rejectUnauthorized: false } };
        } else {
          baseOptions.host = configService.get('database.host');
          // ensure port is a number
          const port = Number(configService.get('database.port')) || undefined;
          if (port) baseOptions.port = port;
          baseOptions.username = configService.get('database.username');
          baseOptions.password = configService.get('database.password');
          baseOptions.database = configService.get('database.database');
          // allow SSL in non-DATABASE_URL setups (optional)
          if (configService.get('database.ssl')) {
            baseOptions.extra = { ssl: { rejectUnauthorized: false } };
          }
        }

        return baseOptions as any;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}