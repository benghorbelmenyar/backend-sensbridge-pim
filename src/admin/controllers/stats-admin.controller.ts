import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsAdminService } from '../services/stats-admin.service';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Admin - Dashboard / Stats')
@Controller('admin/stats')
@UseGuards(AdminGuard)
@ApiBearerAuth('admin-token')
export class StatsAdminController {
  constructor(private readonly statsService: StatsAdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Statistiques Dashboard (KPIs, graphiques)' })
  getDashboard() {
    return this.statsService.getDashboardStats();
  }

  @Get('alerts-timeline')
  @ApiOperation({ summary: 'Timeline alertes (jours)' })
  getAlertsTimeline(@Query('days') days = 7) {
    return this.statsService.getAlertsTimeline(Number(days) || 7);
  }

  @Get('alerts-timeline-by-type')
  @ApiOperation({ summary: 'Timeline alertes par type de son (Pleurs, Sirènes, Verre cassé)' })
  getAlertsTimelineByType(@Query('days') days = 7) {
    return this.statsService.getAlertsTimelineByType(Number(days) || 7);
  }
}

