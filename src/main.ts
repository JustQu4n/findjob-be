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

    // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api');

  const port = configService.get('app.port') || 3000;
  await app.listen(port); 

  console.log(`✅Application is running on: http://localhost:${port}`);
}
bootstrap();
