import { NestFactory } from '@nestjs/core';
// Patch TypeORM Repository to auto-fill uuid primary keys before save
import './database/patch-repository-uuid';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
   // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS with credentials support
  app.enableCors({
    origin: ['http://localhost:5173','http://localhost:5174', 'http://localhost:3000'], // Frontend URLs
    credentials: true, // Allow cookies and credentials
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  // Set global prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api');

  const port = configService.get('app.port') || 5000;
  await app.listen(port); 

  console.log(`✅Application is running on: http://localhost:${port}`);
}
bootstrap();
