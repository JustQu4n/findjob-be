import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
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
