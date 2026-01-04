import { Module } from '@nestjs/common';
import { EmployerManagementModule } from './employer-management/employer-management.module';
import { CategoryModule } from './category/category.module';
import { UserManagementModule } from './user-management/user-management.module';
import { CompanyManagementModule } from './company-management/company-management.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    EmployerManagementModule,
    CategoryModule,
    UserManagementModule,
    CompanyManagementModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminModule {}
