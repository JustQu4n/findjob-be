import { Module } from '@nestjs/common';
import { EmployerManagementModule } from './employer-management/employer-management.module';

@Module({
  imports: [EmployerManagementModule],
  controllers: [],
  providers: [],
})
export class AdminModule {}
