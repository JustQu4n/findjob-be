import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmployerModule } from './modules/employer/employer.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';

@Module({
  imports: [
    AdminModule,
    EmployerModule,
    UsersModule,
    AuthModule,
    DatabaseModule,
    AiAssistantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
