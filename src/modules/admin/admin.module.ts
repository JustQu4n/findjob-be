import { Module } from '@nestjs/common';
import { EmployerManagementModule } from './employer-management/employer-management.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [EmployerManagementModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AdminModule {}
