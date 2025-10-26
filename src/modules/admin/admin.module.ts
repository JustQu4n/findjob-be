import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EmployerManagementModule } from './employer-management/employer-management.module';

@Module({
  imports: [EmployerManagementModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
