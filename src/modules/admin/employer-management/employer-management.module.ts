import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployerManagementController } from './employer-management.controller';
import { EmployerManagementService } from './employer-management.service';
import { Employer } from 'src/database/entities/employer/employer.entity';
import { User } from 'src/database/entities/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employer, User])],
  controllers: [EmployerManagementController],
  providers: [EmployerManagementService],
  exports: [EmployerManagementService],
})
export class EmployerManagementModule {}
