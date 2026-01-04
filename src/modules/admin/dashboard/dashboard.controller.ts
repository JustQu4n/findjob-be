import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOverviewStatistics(query);
  }

  @Get('growth')
  getGrowth() {
    return this.dashboardService.getGrowthStatistics();
  }

  @Get('top-categories')
  getTopCategories(@Query('limit') limit?: number) {
    return this.dashboardService.getTopCategories(limit || 10);
  }

  @Get('top-companies')
  getTopCompanies(@Query('limit') limit?: number) {
    return this.dashboardService.getTopCompanies(limit || 10);
  }

  @Get('application-status')
  getApplicationStatus() {
    return this.dashboardService.getApplicationStatusBreakdown();
  }

  @Get('recent-activities')
  getRecentActivities(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivities(limit || 20);
  }

  @Get('charts/users')
  getUsersChart(@Query('days') days?: number) {
    return this.dashboardService.getUsersChartData(days || 30);
  }

  @Get('charts/job-posts')
  getJobPostsChart(@Query('days') days?: number) {
    return this.dashboardService.getJobPostsChartData(days || 30);
  }

  @Get('charts/applications')
  getApplicationsChart(@Query('days') days?: number) {
    return this.dashboardService.getApplicationsChartData(days || 30);
  }
}
