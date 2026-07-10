import { Controller, Get, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.id, user.role);
  }

  @Get('recent-activity')
  getRecentActivity(
    @CurrentUser() user: any,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.getRecentActivity(user.id, user.role, limit);
  }

  @Get('upcoming-tasks')
  getUpcomingTasks(@CurrentUser() user: any) {
    return this.dashboardService.getUpcomingTasks(user.id, user.role);
  }

  @Get('compliance-overview')
  getComplianceOverview() {
    return this.dashboardService.getComplianceOverview();
  }
}
